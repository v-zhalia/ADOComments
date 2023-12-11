const axios = require('axios')
const { log } = require('./LogUtils')

async function getWorkItemList(organizationProject) {
    let url = `https://${organizationProject.orgName}.visualstudio.com/${organizationProject.project}/_apis/wit/wiql/${organizationProject.queryId}?api-version=7.1-preview.2`
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': codedAuthentication(organizationProject.authorization)
            }
        });
        const workItemList = response.data.workItems
        log("workItemUrl:" + url)
        log("workItemList:" + workItemList.length + "records")
        return workItemList
    } catch (error) {
        log("Failed to get the WorkItem list:" + url)
        log("Cause of failure:" + error)
    }
}

async function getCommentList(workItemId, organizationProject) {
    let url = `https://${organizationProject.orgName}.visualstudio.com/${organizationProject.project}/_apis/wit/workItems/${workItemId}/comments`
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': codedAuthentication(organizationProject.authorization),
            }
        });
        const commentsObj = response.data.comments
        log("commentUrl:" + url)
        log("commentList:" + commentsObj.length + "records")
        return commentsObj
    } catch (error) {
        log("Failed to get the comment list:" + url)
        log("Cause of failure:" + error)
    }
}

module.exports = {
    getWorkItemList,
    getCommentList
}

// Coded authentication
function codedAuthentication(token) {
    const encodedText = 'Basic ' + btoa(':' + token)
    return encodedText
}