
export function useYTDInpatientSales() {
  const themeColors = useThemeColors()
  const patientData = [369, 344, 304, 152, 363]

  const series = shallowRef([{
      data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
    }])

  return reactive({
    height: 280,
    series,
    options: {
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan',
          'United States', 'China', 'Germany'
        ],
      }
    },
  })
}
