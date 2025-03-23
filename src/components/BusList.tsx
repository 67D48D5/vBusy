// src/components/BusList.tsx

"use client";

import { useEffect, useState } from "react";
import { useMapContext } from "@/context/MapContext";
import { useBusStops } from "@/hooks/useBusStops";
import { useBusData } from "@/hooks/useBusData";
import { getRouteInfo } from "@/utils/getRouteInfo";
import type { RouteInfo } from "@/types/route";

type BusListProps = {
  routeName: string;
};

export default function BusList({ routeName }: BusListProps) {
  const { map } = useMapContext();
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      const info = await getRouteInfo(routeName);
      setRouteInfo(info);
    };
    load();
  }, [routeName]);

  const { data: busList, error } = useBusData(routeName);
  const stops = useBusStops(routeName);

  return (
    <div className="fixed bottom-4 left-4 bg-white/90 rounded-lg shadow-md px-4 py-3 w-60 z-20">
      <h2 className="text-sm font-bold text-gray-700 mb-2">
        🚍 {routeName}번 버스 목록 (
        {busList.length > 0 ? `${busList.length}대 운행 중` : "없음"})
      </h2>

      <ul className="text-sm text-gray-800 h-[90px] overflow-y-auto divide-y divide-gray-200">
        {busList.length === 0 && (
          <li
            className={`px-2 py-2 text-xs ${
              error && error !== "ERR:NONE_RUNNING"
                ? "text-red-500"
                : "text-gray-500"
            }`}
          >
            {error === "ERR:NONE_RUNNING"
              ? "운행이 종료되었습니다."
              : error === "ERR:NETWORK"
              ? "⚠️ 네트워크 오류가 발생했습니다."
              : error === "ERR:INVALID_ROUTE"
              ? "⚠️ 유효하지 않은 노선입니다."
              : !error
              ? "버스 데이터를 불러오는 중..."
              : "⚠️ 알 수 없는 오류가 발생했습니다."}
          </li>
        )}

        {busList.map((bus) => {
          const matchedStop = stops.find((stop) => stop.nodeid === bus.nodeid);
          const updown = matchedStop?.updowncd;

          return (
            <li
              key={`${bus.vehicleno}-${bus.gpslati}-${bus.gpslong}`}
              className="flex justify-between items-center px-2 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                if (map) {
                  map.flyTo([bus.gpslati, bus.gpslong], map.getZoom(), {
                    animate: true,
                    duration: 1.5,
                  });
                }
              }}
            >
              <span className="font-bold">{bus.vehicleno}</span>
              <span className="text-gray-500 text-[10px]">
                {bus.nodenm} {updown === 1 ? "⬆️" : updown === 0 ? "⬇️" : "❓"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
