chrome.runtime.onConnect.addListener((port) => {
    console.assert(port.name === "popup");
    port.onMessage.addListener((request) => {
        if (request.action === "calculateScore") {
            score(port)
        }
    });
});

async function score(port) {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (tab && tab.id) {
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: scoreStatistics
        }, () => {
            port.postMessage({ success: true });
        });
    }
}

function scoreStatistics() {

    function crawlRS() {

        scoreSlots = { '低于50': 0, '50-64': 0, '65-78': 0, '大于等于79': 0 };

        exerciseDomList = document.querySelectorAll('.SdAnswerItem-sc-1tg0il4.foEQIH');
        exerciseInfoList = [];
        for (const e of exerciseDomList) {

            headerDom = e.querySelector('.SdAnswerHeader-sc-1r9fit3.cJTuGI');
            exerciseIndexText = headerDom.querySelector('.SdCheckbox-sc-fbb8kh.bHPWtJ.ant-checkbox-wrapper').getElementsByTagName('span')[2];
            exerciseIndexNumber = exerciseIndexText.textContent.split(".")[0];

            exerciseDifficulty = headerDom.getElementsByTagName('div')[2].textContent;


            footerDom = e.querySelector('.SdFooter-sc-fs76i4.jGyiOK');
            scoreText = footerDom.querySelector('.SdScoreBtn-sc-jl2hnn.ePposV').textContent;
            score = Number(scoreText.split(" ")[1].split("/")[0]);

            exerciseInfo = { index: exerciseIndexNumber, difficulty: exerciseDifficulty, scorePoint: score}

            exerciseInfoList.push(exerciseInfo)
            console.log(exerciseInfo)
        }

        return exerciseInfoList;
    }

    const validScoreMap = { "RS 猩际流式刷题": "RS" }
    const exerciseTypeSelector = '.ant-row-flex.ant-row-flex-space-between.ant-row-flex-middle .ant-col .left-col .right .subtitle'

    exerciseTypeText = document.querySelector(exerciseTypeSelector).textContent.trim();
    if (exerciseTypeText in validScoreMap) {
        const exerciseType = validScoreMap[exerciseTypeText]
        switch (exerciseType) {
            case 'RS':
                rsScoreList = crawlRS();
                chrome.storage.local.set({scoreInfo: {'RS': rsScoreList}}, () => {
                })
                break;
            default:
                console.log("Page not valid!");
                break;
        }
    }
}

