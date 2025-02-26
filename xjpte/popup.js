const SCORE_SLOT = [
    'bad', 'six', 'seven', 'eight'
]

const SCORE_SLOT_DISPLAY = {
    'bad': '低于50',
    'six': '50-64',
    'seven': '65-78',
    'eight': '大于等于79'
}

const DIFFICULTY_SLOT = [
    '简单', '中等', '困难'
]

pieChart = {
    title: {
        text: '全量统计'
    },
    series: [
        {
            name: '得分分布',
            type: 'pie',
            radius: '55%',
            label: {
                normal: {
                    show: true,
                    formatter: '{b}: {c}({d}%)'
                }
            },
            data: [
            ],
            itemStyle: {
                normal: {
                    shadowBlur: 200,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};

barChart = {
    title: {
        text: '维度汇总统计'
    },
    tooltip: {},
    legend: {
        data:[]
    },
    xAxis: {
        data: []
    },
    yAxis: {},
    series: []
};

function drawRSCharts(pieChartDiv, barChartDiv, scoreInfo) {
    function aggTotal() {

        var statistics = {bad: 0, six: 0, seven: 0, eight: 0}
        for (let i = 0; i < scoreInfo.RS.length; i++) {
            score = scoreInfo.RS[i].scorePoint
            if (score < 50) {
                statistics.bad++;
            } else if (score >= 50 && score < 65) {
                statistics.six++;
            } else if (score >= 65 && score < 79) {
                statistics.seven++;
            } else {
                statistics.eight++;
            }
        }

        for (const slot in statistics) {
            pieChart.series[0].data.push({name: SCORE_SLOT_DISPLAY[slot], value: statistics[slot]})
        }

        let rsPieChart = echarts.init(pieChartDiv);
        rsPieChart.setOption(pieChart);
    }

    function aggByDifficulty() {
        statistics = {}
        for (let i = 0; i < scoreInfo.RS.length; i++) {
            score = scoreInfo.RS[i].scorePoint

            difficulty = scoreInfo.RS[i].difficulty
            xAxiSlot = 'bad'

            if (score < 50) {
                xAxiSlot = 'bad'
            } else if (score >= 50 && score < 65) {
                xAxiSlot = 'six'
            } else if (score >= 65 && score < 79) {
                xAxiSlot = 'seven'
            } else {
                xAxiSlot = 'eight'
            }

            if (xAxiSlot in statistics) {
                if (difficulty in statistics[xAxiSlot]) {
                    statistics[xAxiSlot][difficulty]++;
                } else {
                    statistics[xAxiSlot][difficulty] = 1;
                }
            } else {
                statistics[xAxiSlot] = {};
                statistics[xAxiSlot][difficulty] = 1;
            }
        }

        barChart.title.text = '按难度汇总统计'
        // barChartData = []
        for (let difficulty of DIFFICULTY_SLOT) {
            barChart.xAxis.data.push([difficulty])
        }

        // barChartSeries = []
        for (let scoreSlot of SCORE_SLOT) {

            barChart.legend.data.push(SCORE_SLOT_DISPLAY[scoreSlot])

            let s = {
                name: SCORE_SLOT_DISPLAY[scoreSlot],
                type: 'bar',
                data: []
            }

            for (let difficulty of DIFFICULTY_SLOT) {
                scoreNum = statistics[scoreSlot][difficulty]
                if (!scoreNum) {
                    scoreNum = 0
                }
                s.data.push(scoreNum)
            }

            barChart.series.push(s)
        }


        let rsBarChart = echarts.init(barChartDiv);
        rsBarChart.setOption(barChart);

        // barChartDiv.textContent = JSON.stringify(barChart)
    }

    aggTotal();
    aggByDifficulty();
}

document.addEventListener('DOMContentLoaded', (event) => {

    chrome.storage.local.remove(['scoreInfo'], () => {
        const port = chrome.runtime.connect({ name: "popup" });
        port.onMessage.addListener((response) => {

            if (response && response.success) {
                let pieChartDiv = document.getElementById("pie")
                let barChartDiv = document.getElementById("bar")
                chrome.storage.local.get(['scoreInfo'], (result) => {
                    if (result.scoreInfo) {
                        if ('RS' in result.scoreInfo) {
                            drawRSCharts(pieChartDiv, barChartDiv, result.scoreInfo);
                        }
                    }
                })
            }
        });

        port.postMessage({ action: "calculateScore", data: "Hello from popup!" });
    })
});