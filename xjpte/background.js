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

    const exercisesSelector = '.SdAnswerItem-sc-1tg0il4.foEQIH'
    const headerSelector = '.SdAnswerHeader-sc-1r9fit3.cJTuGI'
    const exerciseIndexTextSelector = '.SdCheckbox-sc-fbb8kh.bHPWtJ.ant-checkbox-wrapper'
    const footerSelector = '.SdFooter-sc-fs76i4.jGyiOK'
    const scoreTextSelector = '.SdScoreBtn-sc-jl2hnn.ePposV'

    function crawlScoreRARS(difficultyIndex) {
        exerciseDomList = document.querySelectorAll(exercisesSelector);
        exerciseInfoList = [];
        for (const e of exerciseDomList) {
            headerDom = e.querySelector(headerSelector);
            exerciseIndexText = headerDom.querySelector(exerciseIndexTextSelector).getElementsByTagName('span')[2];
            exerciseIndexNumber = exerciseIndexText.textContent.split(".")[0];

            exerciseDifficulty = headerDom.getElementsByTagName('div')[difficultyIndex].textContent;


            footerDom = e.querySelector(footerSelector);
            scoreText = footerDom.querySelector(scoreTextSelector).textContent;
            score = Number(scoreText.split(" ")[1].split("/")[0]);

            exerciseInfo = { index: exerciseIndexNumber, difficulty: exerciseDifficulty, scorePoint: score}

            exerciseInfoList.push(exerciseInfo)
            console.log(exerciseInfo)
        }

        return exerciseInfoList;
    }

    const validScoreMap = { "RS 猩际流式刷题": "RS", "RA 猩际流式刷题": "RA"}
    const exerciseTypeSelector = '.ant-row-flex.ant-row-flex-space-between.ant-row-flex-middle .ant-col .left-col .right .subtitle'

    exerciseTypeText = document.querySelector(exerciseTypeSelector).textContent.trim();
    if (exerciseTypeText in validScoreMap) {
        const exerciseType = validScoreMap[exerciseTypeText]
        switch (exerciseType) {
            case 'RS':
                // rsScoreList = crawlRS();
                rsScoreList = crawlScoreRARS(2)
                chrome.storage.local.set({scoreInfo: {'RS': rsScoreList}}, () => {
                })
                break;
            case 'RA':
                raScoreList = crawlScoreRARS(3);
                chrome.storage.local.set({scoreInfo: {'RA': raScoreList}}, () => {
                })
                break;
            default:
                console.log("Page not valid!");
                break;
        }
    }
}

