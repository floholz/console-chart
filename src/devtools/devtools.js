chrome.devtools.panels.create("Console Chart",
    "assets/icon.svg",
    "src/devtools/devtools.html",
    function(panel) {
        // code invoked on panel creation
        initChartJs()
        initConsoleLogsParser()
    }
);

let chart;
const output = document.getElementById("output");

function parseLogs(message, timestamp) {
    if (!chart) return;
    
    chart.data.labels = [...chart.data.labels, timestamp]
    chart.data.datasets[0].data.push(Math.random() * 10 + 10)

    output.textContent += `${message} @ ${timestamp}\n`;
}

function initChartJs() {
    const ctx = document.getElementById('console_chart');

    const labels = [1, 2, 3, 4];
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Dataset 1',
                data: [10, 20, 15, 25],
                borderColor: 'red',
                backgroundColor: '#3f4749',
            }
        ]
    };
    
    chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Chart.js Line Chart'
                }
            }
        },
    });
}

function initConsoleLogsParser() {
    // Evaluate script in the inspected window to monitor console.log messages
    chrome.scripting.executeScript({
        target: {
            tabId: chrome.devtools.inspectedWindow.tabId
        },
        func: () => {
            const originalLog = console.log;
            console.log = function(...args) {
                originalLog(...args);
                chrome.runtime.sendMessage({type: 'log', message: args.join(' ')});
            };
        }
    });
    
    
    // chrome.devtools.inspectedWindow.eval(
    //     `
    //     (function() {
    //         const originalLog = console.log;
    //         console.log = function(...args) {
    //             originalLog(...args);
    //             chrome.runtime.sendMessage({type: 'log', message: args.join(' ')});
    //         };
    //     })();
    //     `,
    //     function (result, isException) {
    //         if (isException) {
    //             console.error("Error injecting script:", isException);
    //         }
    //     }
    // );

    // Listen for messages from the inspected page
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "log") {
            parseLogs(request.message, request.timeStamp);
        }
    });
}