export function calculateComfortIndex({  temperature,
  humidity,
  windSpeed,
  cloudiness,
visibility,
}) {
//temperature
 const tempScore = Math.max(0,100 - Math.abs(temperature - 22)*5);
 const humidityScore  = Math.max(0,100 - Math.abs(humidity - 50)*2);
 const windspeedScore = Math.max(0,100 - Math.abs(windSpeed - 2)*20);
  const cloudinessScore = 100 - cloudiness;
const visibilityScore = Math.min( 100,(visibility / 10000) * 100);


 const score =
    tempScore * 0.35 +
    humidityScore  * 0.25 +
    windspeedScore * 0.15 +
    cloudinessScore * 0.10+
visibilityScore*0.15;

  return Math.round(Math.max(0, Math.min(100, score)));
}   