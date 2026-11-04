export const initial = () => ({fan:true, fault:false, streak:0});
export function step(s, t) {
  if (!Number.isFinite(t) || t < -10 || t > 80) return {fan:true, fault:true, streak:0};
  if (s.fault && s.streak < 2) return {fan:true, fault:true, streak:s.streak+1};
  return {fan:t >= 38 ? true : t <= 34 ? false : s.fan, fault:false, streak:0};
}
export function thermal(t,fan) {
  const g=fan?3.2:.9, eq=25+24/g;
  return eq+(t-eq)*Math.exp(-g/180);
}
