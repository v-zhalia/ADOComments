const { organizationProjectList } = require('./src/AuthenticationConfig.js')
const { getWorkItemList, getCommentList } = require('./src/utils/AxiosUtils.js')
const { log } = require('./src/utils/LogUtils.js')
const { targetPerson } = require('./src/PersonConfig.js')
const { isAfterMidnightYesterday, isOneAfterSecond, formatCurrentTime } = require('./src/utils/DateUtils.js')
const { uploadFilesToBlob } = require('./src/utils/BlobUtils.js')

// Initial CSV data
let jsonData = []

async function task() {
    // clear blob
    uploadFilesToBlob("")

    for (let i = 0; i < organizationProjectList.length; i++) {
        const organizationProject = organizationProjectList[i];
        // get workItemList
        const workItemList = await getWorkItemList(organizationProject);
        for (let i = 0; i < workItemList.length; i++) {
            const workItem = workItemList[i];
            // Gets all comments for the workitem
            const commentList = await getCommentList(workItem.id, organizationProject);
            for (let j = 0; j < commentList.length; j++) {
                const comment = commentList[j];

                // Summarize the people who are @
                let mentionedPerson = summarizePeople(comment)

                // if no one is @, skip
                if (mentionedPerson.length == 0) {
                    continue
                }

                // Determine whether to save to Kusto
                const flag = isSaveKusto(commentList, comment, mentionedPerson)

                // Add data to the json array
                if (flag) {
                    addDataToJsonArray(comment, workItem.id, organizationProject, mentionedPerson)
                }
            }
        }
    }

}

async function Main() {
    try {
        log('=====start=====' + formatCurrentTime())
        await task()
        if (jsonData.length == 0) {
            log('No data today')
            return
        } else {
            // Upload to blob
            uploadFilesToBlob(jsonToCsv(jsonData))
        }
        log('=====end=====' + formatCurrentTime())
        log('=====Data upload success=====')
    } catch (error) {
        log(error)
    }

}

Main()

// Summarize the people who are @
function summarizePeople(comment) {
    let mentionedPerson = []
    targetPerson.forEach(person => {
        if (isAfterMidnightYesterday(comment.createdDate) && comment.text.includes(person.displayName)) {
            log(`${person.displayName}in${comment.createdDate}was mentioned`)
            mentionedPerson.push(person)
        }
    });
    if (mentionedPerson.length > 0) {
        log('mentionedPerson:' + JSON.stringify(mentionedPerson))
    }
    return mentionedPerson
}

// Determine whether to save to Kusto
function isSaveKusto(commentList, comment, mentionedPerson) {
    let personEmailList = mentionedPerson.map(person => person.email)
    for (let j = 0; j < commentList.length; j++) {
        const commentChild = commentList[j];
        if (isOneAfterSecond(commentChild.createdDate, comment.createdDate) && personEmailList.includes(commentChild.createdBy.uniqueName)) {
            log(`${commentChild.createdBy.uniqueName} replied to ${comment.createdBy.uniqueName} in ${comment.createdDate} at ${commentChild.createdDate}`)
            return false
        }
    }
    return true
}

// Add data to the json array
function addDataToJsonArray(element, workItemId, organizationProject, mentionedPerson) {
    // WorkItemId,Project,Org,CommentId,CommentBy,CommentDate,CommentTo,Comment,ProcessDate
    let commentTo = ''
    mentionedPerson.forEach(person => {
        commentTo = commentTo + '@' + person.displayName + ' '
    })

    let data = {
        workItemId: workItemId,
        Project: organizationProject.project,
        Org: organizationProject.orgName,
        CommentId: element.id,
        CommentBy: element.createdBy.uniqueName,
        CommentDate: element.createdDate,
        CommentTo: commentTo,
        Comment: stripHTML(element.text).replaceAll('&nbsp;', ' ').replaceAll(',', ' '),
        ProcessDate: formatCurrentTime()
    }
    jsonData.push(data)
    log('=====add data=====' + data.workItemId + ' ' + data.CommentId + ' ' + data.CommentBy + ' ' + data.CommentDate + ' ' + data.CommentTo + ' ' + data.ProcessDate)
}

function jsonToCsv(data) {
    // Extract all keys (column headers)
    const columns = Object.keys(data[0]);

    // Add the column headings to the CSV string
    let csv = '';

    // Iterate over the data, adding each row to the CSV string
    data.forEach((item) => {
        const row = columns.map(column => item[column]).join(',');
        csv += row + '\n';
    });

    return csv;
}

function stripHTML(html) {
    // Use regular expressions to match and replace HTML tags
    return html.replace(/<[^>]*>/g, ' ');
}

