
export function useOutPatientPerDay() {
  const themeColors = useThemeColors()
  const patientData = [369, 344, 304, 152, 363]

  const series = shallowRef([
    {
      name: 'Patient',
      data: patientData,
    },
    {
      name: 'Average',
      data: Array(5).fill(Math.round(patientData.reduce((a, b) => a + b, 0) / 5)),
      style: {
        opacity: 0.3,
        color: themeColors.primary,
        fontsize: '8px',
      }
    },
  ])

  return reactive({
    height: 280,
    type: 'line',
    series,
    options: {
      chart: {
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      title: {
        text: 'Outpatient Per Day',
        align: 'center',
      },
      colors: [themeColors.primary, themeColors.danger],
      stroke: {
        width: [4, 2],
        curve: 'straight',
        dashArray: [0, 5],
      },
      markers: {
        size: 6,
        hover: {
          sizeOffset: 2,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val}M`,
        style: {
          fontSize: '12px',
          colors: ['#6B7280'], // tailwind gray-740
        },
        offsetY: -10,
        background: {
          enabled: false,
        },
      },
      xaxis: {
        categories: ['1', '2', '3', '4', '5'],
        labels: {
          style: {
            fontSize: '12px',
            colors: '#6B7280', // gray-300
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `${val / 1000}bn`,
          style: {
            fontSize: '12px',
            colors: '#6B7280',
          },
        },
        min: 150,
        max: 400,
        tickAmount: 2,
      },
      grid: {
        borderColor: '#E5E7EB', // tailwind gray-200
        strokeDashArray: 3,
      },
      legend: {
        show: false,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val}M`,
        },
      },
    },
  })
}
