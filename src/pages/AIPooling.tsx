import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { clusterShipments, type Shipment as AlgoShipment, type MatchOptions } from "@/lib/matching";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Loosened typings to avoid react-leaflet prop TS frictions
const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;
const AnyCircleMarker = CircleMarker as any;
const AnyTooltip = Tooltip as any;

function parseCoord(s: string): { lat: number; lng: number } | null {
  const m = s?.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (!m) return null;
  return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
}

const delhiCenter: LatLngExpression = [28.6139, 77.2090];

const AIPooling = () => {
  const { toast } = useToast();
  const [shipments, setShipments] = useState<any[]>([]);

  // Rule controls (defaults align with matching.ts)
  const [opts, setOpts] = useState<MatchOptions>({
    maxPoolSize: 3,
    pickupJoinDistanceKm: 6,
    minPairScore: 0.45,
    wPickupProximity: 0.4,
    wRouteSimilarity: 0.35,
    wTimeOverlap: 0.15,
    wDropProximity: 0.1,
  });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select('id, origin, destination, pickup_time, dropoff_time, status, pooled, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) {
        toast({ title: 'Error', description: error.message });
      }
      setShipments(data ?? []);
    })();
  }, []);

  const algoShipments = useMemo(() => {
    return shipments
      .map((r) => {
        const po = parseCoord(r.origin);
        const pd = parseCoord(r.destination);
        if (!po || !pd) return null as any;
        return { id: r.id, pickup: po, drop: pd, readyAt: r.pickup_time ?? undefined, dueBy: r.dropoff_time ?? undefined } as AlgoShipment;
      })
      .filter(Boolean) as AlgoShipment[];
  }, [shipments]);

  const pools = useMemo(() => {
    try {
      return clusterShipments(algoShipments, opts).slice(0, 10);
    } catch (e) {
      return [];
    }
  }, [algoShipments, opts]);

  const mapCenter: LatLngExpression = useMemo(() => {
    if (algoShipments.length === 0) return delhiCenter;
    const lat = algoShipments.reduce((a, s) => a + s.pickup.lat, 0) / algoShipments.length;
    const lng = algoShipments.reduce((a, s) => a + s.pickup.lng, 0) / algoShipments.length;
    return [lat, lng] as LatLngExpression;
  }, [algoShipments]);

  return (
    <>
      <Helmet>
        <title>AI Pooling Tool | UrbanLift.AI</title>
        <meta name="description" content="AI pooling tool using rule and distance matching to cluster shipments." />
        <link rel="canonical" href="/ai-pooling" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <header>
            <h1 className="text-2xl font-semibold">AI Pooling Tool</h1>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Rules & Weights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="maxPoolSize">Max pool size: {opts.maxPoolSize}</Label>
                  <Slider
                    id="maxPoolSize"
                    value={[opts.maxPoolSize ?? 3]}
                    min={1}
                    max={6}
                    step={1}
                    onValueChange={([v]) => setOpts(o => ({ ...o, maxPoolSize: v }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupJoinDistanceKm">Pickup join distance (km): {opts.pickupJoinDistanceKm}</Label>
                  <Slider
                    id="pickupJoinDistanceKm"
                    value={[opts.pickupJoinDistanceKm ?? 6]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={([v]) => setOpts(o => ({ ...o, pickupJoinDistanceKm: v }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minPairScore">Min pair score: {opts.minPairScore?.toFixed(2)}</Label>
                  <Slider
                    id="minPairScore"
                    value={[opts.minPairScore ?? 0.45]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([v]) => setOpts(o => ({ ...o, minPairScore: v }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weights</Label>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm">Pickup proximity: {opts.wPickupProximity?.toFixed(2)}</div>
                      <Slider value={[opts.wPickupProximity ?? 0.4]} min={0} max={1} step={0.05} onValueChange={([v]) => setOpts(o => ({ ...o, wPickupProximity: v }))} />
                    </div>
                    <div>
                      <div className="text-sm">Route similarity: {opts.wRouteSimilarity?.toFixed(2)}</div>
                      <Slider value={[opts.wRouteSimilarity ?? 0.35]} min={0} max={1} step={0.05} onValueChange={([v]) => setOpts(o => ({ ...o, wRouteSimilarity: v }))} />
                    </div>
                    <div>
                      <div className="text-sm">Time overlap: {opts.wTimeOverlap?.toFixed(2)}</div>
                      <Slider value={[opts.wTimeOverlap ?? 0.15]} min={0} max={1} step={0.05} onValueChange={([v]) => setOpts(o => ({ ...o, wTimeOverlap: v }))} />
                    </div>
                    <div>
                      <div className="text-sm">Drop proximity: {opts.wDropProximity?.toFixed(2)}</div>
                      <Slider value={[opts.wDropProximity ?? 0.1]} min={0} max={1} step={0.05} onValueChange={([v]) => setOpts(o => ({ ...o, wDropProximity: v }))} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map & Pools */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Map view</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-hidden rounded-lg border bg-card">
                    <AnyMapContainer center={mapCenter} zoom={11} scrollWheelZoom={false} className="h-[420px] w-full">
                      <AnyTileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {pools.map((pool, pIdx) => (
                        <>
                          {pool.shipments.map((sh) => {
                            const s = shipments.find(x => x.id === sh.id) ?? { id: sh.id, origin: '', destination: '' };
                            const po = parseCoord(s.origin);
                            const pd = parseCoord(s.destination);
                            if (!po || !pd) return null as any;
                            return (
                              <>
                                <AnyCircleMarker key={`p-${sh.id}`} center={[po.lat, po.lng]} radius={6} pathOptions={{ color: "hsl(var(--primary))" }}>
                                  <AnyTooltip>Pool #{pIdx + 1} • Pickup</AnyTooltip>
                                </AnyCircleMarker>
                                <AnyCircleMarker key={`d-${sh.id}`} center={[pd.lat, pd.lng]} radius={6} pathOptions={{ color: "hsl(var(--brand-2))" }}>
                                  <AnyTooltip>Pool #{pIdx + 1} • Drop</AnyTooltip>
                                </AnyCircleMarker>
                              </>
                            );
                          })}
                        </>
                      ))}
                    </AnyMapContainer>
                  </div>
                </CardContent>
              </Card>

              {pools.length === 0 ? (
                <p className="text-muted-foreground">No pools found yet. Add more shipments or adjust thresholds.</p>
              ) : (
                pools.map((pool, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle>
                        Pool #{idx + 1} • <Badge variant="secondary">{pool.shipments.length} shipments</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pool.shipments.map((sh) => {
                        const s = shipments.find(x => x.id === sh.id) ?? { id: sh.id, origin: '', destination: '', status: '', pooled: false };
                        return (
                          <div key={sh.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-b-0">
                            <div className="min-w-0">
                              <div className="font-medium truncate max-w-[520px]" title={`${s.origin} → ${s.destination}`}>{s.origin} → {s.destination}</div>
                              <div className="text-sm text-muted-foreground">{s.status}{s.pooled ? ' • pooled' : ''}</div>
                            </div>
                            <Badge>#{String(sh.id).slice(0,8)}</Badge>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AIPooling;
