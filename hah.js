function splitBill() {
    let bill = Number(document.getElementById("totalBill").value), people = Number(document.getElementById("peopleCount").value);
    let extra = Number(document.getElementById("extraFee").value), discount = Number(document.getElementById("discount").value);
    if (bill <= 0 || people <= 0) return alert("Please enter a valid bill amount and number of people.");

    let finalTotal = bill + extra - discount, perPerson = finalTotal / people;
    document.getElementById("totalAmount").innerHTML = "Total Amount: Rs. " + finalTotal.toFixed(2);
    document.getElementById("perPersonAmount").innerHTML = "Each Person Pays: Rs. " + perPerson.toFixed(2);
    let message = "Bill Split Details:\nTotal Bill: Rs. " + finalTotal.toFixed(2) + "\nPeople: " + people + "\nPer Person: Rs. " + perPerson.toFixed(2) + "\nPlease transfer your share!";
    document.getElementById("summaryText").value = message;
    saveHistory("Normal Split", message);
}

function resetForm() {
    let ids = ["totalBill", "peopleCount", "extraFee", "discount", "summaryText"];
    for (let i = 0; i < ids.length; i++) document.getElementById(ids[i]).value = "";
    document.getElementById("totalAmount").innerHTML = "Total Amount: Rs. 0.00";
    document.getElementById("perPersonAmount").innerHTML = "Each Person Pays: Rs. 0.00";
}

function copySummary() { copyText("summaryText"); }
function copyPersonalSummary() { copyText("personalSummaryText"); }
function copyText(id) {
    let summary = document.getElementById(id);
    if (!summary || summary.value === "") return alert("Calculate bill first before copying!");
    summary.select();
    navigator.clipboard.writeText(summary.value);
    alert("Copied to clipboard!");
}

let personCount = 2;
function getPersonHTML(n) {
    return '<label>Person ' + n + ' Name:</label><input type="text" class="personName" placeholder="Enter Person ' + n + ' name"><label>Amount Spent (Rs):</label><input type="number" class="personAmount" placeholder="Enter amount spent">';
}
function addPerson() {
    personCount++;
    let div = document.createElement("div");
    div.className = "person-box";
    div.innerHTML = getPersonHTML(personCount);
    document.getElementById("personList").appendChild(div);
}

function calculatePersonalSplit() {
    let names = document.getElementsByClassName("personName"), amounts = document.getElementsByClassName("personAmount");
    let count = names.length, totalSpent = 0;
    for (let i = 0; i < count; i++) {
        let amt = Number(amounts[i].value);
        if (amt < 0) return alert("Amount spent cannot be negative.");
        totalSpent += amt;
    }
    if (totalSpent <= 0) return alert("Total spent must be greater than 0.");

    let fairShare = totalSpent / count;
    document.getElementById("personalTotalAmount").innerHTML = "Total Spent: Rs. " + totalSpent.toFixed(2);
    document.getElementById("personalPerPersonAmount").innerHTML = "Each Person's Share: Rs. " + fairShare.toFixed(2);

    let message = "Personal Split Details:\nTotal Spent: Rs. " + totalSpent.toFixed(2) + "\nPeople: " + count + "\nEach Person's Share: Rs. " + fairShare.toFixed(2) + "\n\nBreakdown:\n";
    for (let i = 0; i < count; i++) {
        let name = names[i].value.trim() || ("Person " + (i + 1));
        let paid = Number(amounts[i].value), diff = paid - fairShare;
        if (diff > 0.005) message += "- " + name + ": Paid Rs. " + paid.toFixed(2) + " (Gets back Rs. " + diff.toFixed(2) + ")\n";
        else if (diff < -0.005) message += "- " + name + ": Paid Rs. " + paid.toFixed(2) + " (Owes Rs. " + Math.abs(diff).toFixed(2) + ")\n";
        else message += "- " + name + ": Paid Rs. " + paid.toFixed(2) + " (Settled up)\n";
    }
    document.getElementById("personalSummaryText").value = message;
    saveHistory("Personal Split", message);
}

function resetPersonalForm() {
    personCount = 2;
    document.getElementById("personList").innerHTML = '<div class="person-box">' + getPersonHTML(1) + '</div><div class="person-box">' + getPersonHTML(2) + '</div>';
    document.getElementById("personalTotalAmount").innerHTML = "Total Spent: Rs. 0.00";
    document.getElementById("personalPerPersonAmount").innerHTML = "Each Person's Share: Rs. 0.00";
    document.getElementById("personalSummaryText").value = "";
}

let itemCount = 1;
function getItemHTML(n) {
    return '<label>Item ' + n + ':</label><input type="text" class="itemName" placeholder="Item name (e.g. Pizza)"><label>Price (Rs):</label><input type="number" class="itemPrice" placeholder="Enter item price"><label>Who shared it? (names separated by comma):</label><input type="text" class="itemPeople" placeholder="e.g. Alex, Bob">';
}
function addItem() {
    itemCount++;
    let div = document.createElement("div");
    div.className = "item-box";
    div.innerHTML = getItemHTML(itemCount);
    document.getElementById("itemList").appendChild(div);
}

function calculateCustomSplit() {
    let names = document.getElementsByClassName("itemName"), prices = document.getElementsByClassName("itemPrice"), consumers = document.getElementsByClassName("itemPeople");
    let total = 0, personTotals = {};
    for (let i = 0; i < names.length; i++) {
        let price = Number(prices[i].value), peopleStr = consumers[i].value.trim();
        if (price <= 0 || peopleStr === "") continue;
        let raw = peopleStr.split(","), people = [];
        for (let j = 0; j < raw.length; j++) {
            let p = raw[j].trim();
            if (p !== "") people.push(p);
        }
        if (people.length === 0) continue;
        total += price;
        let splitAmount = price / people.length;
        for (let j = 0; j < people.length; j++) personTotals[people[j]] = (personTotals[people[j]] || 0) + splitAmount;
    }
    if (total <= 0) return alert("Please enter at least one item with a valid price and people.");

    document.getElementById("customTotalAmount").innerText = "Total Bill: Rs. " + total.toFixed(2);
    let message = "Custom Split Details:\nTotal Bill: Rs. " + total.toFixed(2) + "\n\nEach Person Pays:\n";
    for (let p in personTotals) message += "- " + p + ": Rs. " + personTotals[p].toFixed(2) + "\n";
    document.getElementById("customSummaryText").value = message;
    saveHistory("Custom Split", message);
}

function resetCustomForm() {
    itemCount = 1;
    document.getElementById("itemList").innerHTML = '<div class="item-box">' + getItemHTML(1) + '</div>';
    document.getElementById("customTotalAmount").innerText = "Total Bill: Rs. 0.00";
    document.getElementById("customSummaryText").value = "";
}

function saveHistory(type, summary) {
    let card = '<div class="history-card"><strong>' + type + '</strong><pre>' + summary + '</pre></div>';
    let saved = localStorage.getItem("splitHistory") || "";
    localStorage.setItem("splitHistory", card + saved);
    let list = document.getElementById("historyList");
    if (list) list.innerHTML = card + saved;
}

function loadHistory() {
    let list = document.getElementById("historyList");
    if (!list) return;
    let saved = localStorage.getItem("splitHistory");
    list.innerHTML = saved ? saved : "<p style='text-align:center;'>No split history yet.</p>";
}

function clearHistory() {
    if (confirm("Clear all split history?")) {
        localStorage.removeItem("splitHistory");
        loadHistory();
    }
}

if (document.getElementById("historyList")) loadHistory();
