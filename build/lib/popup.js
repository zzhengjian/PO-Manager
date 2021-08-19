


$(document).ready(async function() {
    $("#AddElement").on("click", async function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
        {
            chrome.tabs.sendMessage(tabs[0].id, {action: "select", selecting: true}, function(response)
            {
                console.log(response);
            });
        });

    
    })

})
