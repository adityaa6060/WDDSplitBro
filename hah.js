function goToMainScreen() {
    document.getElementById("welcomeScreen").style.display = "none";
    document.getElementById("mainScreen").style.display = "block";
}

function showTab(tab) {
    ["normal", "personal", "custom", "history"].forEach(t => {
        document.getElementById(t + "Screen").style.display = (t === tab) ? "block" : "none";
        document.getElementById("nav" + t.charAt(0).toUpperCase() + t.slice(1)).className =
            (t === tab) ? "nav-btn active-nav" : "nav-btn";
    });
    if (tab === "history") loadHistory();
}

function splitBill() {
    let bill = Number(document.getElementById("totalBill").value);
    let people = Number(document.getElementById("peopleCount").value);
    let extra = Number(document.getElementById("extraFee").value);
    let discount = Number(document.getElementById("discount").value);

    if (bill <= 0 || people <= 0) {
        alert("Please enter a valid bill amount and number of people.");
        return;
    }

    let finalTotal = bill + extra - discount;
    let perPerson = finalTotal / people;

    document.getElementById("totalAmount").innerHTML = "Total Amount: Rs. " + finalTotal.toFixed(2);
    document.getElementById("perPersonAmount").innerHTML = "Each Person Pays: Rs. " + perPerson.toFixed(2);

    let message = "Bill Split Details:\n" +
        "Total Bill: Rs. " + finalTotal.toFixed(2) + "\n" +
        "People: " + people + "\n" +
        "Per Person: Rs. " + perPerson.toFixed(2) + "\n" +
        "Please transfer your share!";

    document.getElementById("summaryText").value = message;
    saveHistory("Normal Split", message);
}

function resetForm() {
    document.getElementById("totalBill").value = "";
    document.getElementById("peopleCount").value = "";
    document.getElementById("extraFee").value = "";
    document.getElementById("discount").value = "";
    document.getElementById("totalAmount").innerHTML = "";
    document.getElementById("perPersonAmount").innerHTML = "";
    document.getElementById("summaryText").value = "";
}

function copySummary() {
    copyText("summaryText");
}

function copyPersonalSummary() {
    copyText("personalSummaryText");
}

function copyText(id) {
    let summary = document.getElementById(id);
    if (summary.value === "") {
        alert("Calculate bill first before copying!");
        return;
    }
    summary.select();
    navigator.clipboard.writeText(summary.value);
    alert("Copied to clipboard!");
}

let personCount = 2;

function getPersonHTML(n) {
    return '<label>Person ' + n + ' Name:</label>' +
        '<input type="text" class="personName" placeholder="Enter Person ' + n + ' name">' +
        '<label>Amount Spent (Rs):</label>' +
        '<input type="number" class="personAmount" placeholder="Enter amount spent">';
}

function addPerson() {
    personCount++;
    let div = document.createElement("div");
    div.className = "person-box";
    div.innerHTML = getPersonHTML(personCount);
    document.getElementById("personList").appendChild(div);
}

function calculatePersonalSplit() {
    let names = document.getElementsByClassName("personName");
    let amounts = document.getElementsByClassName("personAmount");
    let count = names.length;
    let totalSpent = 0;

    for (let i = 0; i < count; i++) {
        let amt = Number(amounts[i].value);
        if (amt < 0) {
            alert("Amount spent cannot be negative.");
            return;
        }
        totalSpent += amt;
    }

    if (totalSpent <= 0) {
        alert("Total spent must be greater than 0.");
        return;
    }

    let fairShare = totalSpent / count;
    document.getElementById("personalTotalAmount").innerHTML = "Total Spent: Rs. " + totalSpent.toFixed(2);
    document.getElementById("personalPerPersonAmount").innerHTML = "Each Person's Share: Rs. " + fairShare.toFixed(2);

    let message = "Personal Split Details:\n" +
        "Total Spent: Rs. " + totalSpent.toFixed(2) + "\n" +
        "People: " + count + "\n" +
        "Each Person's Share: Rs. " + fairShare.toFixed(2) + "\n\n" +
        "Breakdown:\n";

    for (let i = 0; i < count; i++) {
        let name = names[i].value.trim();
        if (name === "") {
            name = "Person " + (i + 1);
        }
        let paid = Number(amounts[i].value);
        let diff = paid - fairShare;

        if (diff > 0.005) {
            message += "- " + name + ": Paid Rs. " + paid.toFixed(2) + " (Gets back Rs. " + diff.toFixed(2) + ")\n";
        } else if (diff < -0.005) {
            message += "- " + name + ": Paid Rs. " + paid.toFixed(2) + " (Owes Rs. " + Math.abs(diff).toFixed(2) + ")\n";
        } else {
            message += "- " + name + ": Paid Rs. " + paid.toFixed(2) + " (Settled up)\n";
        }
    }

    document.getElementById("personalSummaryText").value = message;
    saveHistory("Personal Split", message);
}

function resetPersonalForm() {
    personCount = 2;
    document.getElementById("personList").innerHTML =
        '<div class="person-box">' + getPersonHTML(1) + '</div>' +
        '<div class="person-box">' + getPersonHTML(2) + '</div>';
    document.getElementById("personalTotalAmount").innerHTML = "Total Spent: Rs. 0.00";
    document.getElementById("personalPerPersonAmount").innerHTML = "Each Person's Share: Rs. 0.00";
    document.getElementById("personalSummaryText").value = "";
}

let itemCount = 1;

function addItem() {
    itemCount++;
    let div = document.createElement("div");
    div.className = "item-box";
    div.innerHTML = '<label>Item ' + itemCount + ':</label>' +
        '<input type="text" class="itemName" placeholder="Item name (e.g. Pizza)">' +
        '<label>Price (Rs):</label>' +
        '<input type="number" class="itemPrice" placeholder="Enter item price">' +
        '<label>Who shared it? (names separated by comma):</label>' +
        '<input type="text" class="itemPeople" placeholder="e.g. Alex, Bob">';
    document.getElementById("itemList").appendChild(div);
}

function calculateCustomSplit() {
    let names = document.getElementsByClassName("itemName");
    let prices = document.getElementsByClassName("itemPrice");
    let consumers = document.getElementsByClassName("itemPeople");
    let total = 0;
    let personTotals = {};

    for (let i = 0; i < names.length; i++) {
        let price = Number(prices[i].value);
        let peopleStr = consumers[i].value.trim();
        if (price <= 0 || !peopleStr) continue;

        total += price;
        let people = peopleStr.split(",").map(p => p.trim()).filter(p => p.length > 0);
        if (people.length === 0) continue;

        let splitAmount = price / people.length;
        people.forEach(p => {
            personTotals[p] = (personTotals[p] || 0) + splitAmount;
        });
    }

    if (total <= 0) {
        alert("Please enter at least one item with a valid price and people.");
        return;
    }

    document.getElementById("customTotalAmount").innerText = "Total Bill: Rs. " + total.toFixed(2);
    let message = "Custom Split Details:\nTotal Bill: Rs. " + total.toFixed(2) + "\n\nEach Person Pays:\n";
    for (let p in personTotals) {
        message += "- " + p + ": Rs. " + personTotals[p].toFixed(2) + "\n";
    }
    document.getElementById("customSummaryText").value = message;
    saveHistory("Custom Split", message);
}

function resetCustomForm() {
    itemCount = 1;
    document.getElementById("itemList").innerHTML =
        '<div class="item-box">' +
        '<label>Item 1:</label>' +
        '<input type="text" class="itemName" placeholder="Item name (e.g. Pizza)">' +
        '<label>Price (Rs):</label>' +
        '<input type="number" class="itemPrice" placeholder="Enter item price">' +
        '<label>Who shared it? (names separated by comma):</label>' +
        '<input type="text" class="itemPeople" placeholder="e.g. Alex, Bob">' +
        '</div>';
    document.getElementById("customTotalAmount").innerText = "Total Bill: Rs. 0.00";
    document.getElementById("customSummaryText").value = "";
}

function saveHistory(type, summary) {
    let history = JSON.parse(localStorage.getItem("splitHistory") || "[]");
    history.unshift({ type: type, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), summary: summary });
    if (history.length > 15) history.pop();
    localStorage.setItem("splitHistory", JSON.stringify(history));
}

function loadHistory() {
    let history = JSON.parse(localStorage.getItem("splitHistory") || "[]");
    let list = document.getElementById("historyList");
    if (history.length === 0) {
        list.innerHTML = "<p style='text-align:center;'>No split history yet.</p>";
        return;
    }
    list.innerHTML = history.map(item =>
        '<div class="history-card">' +
        '<strong>' + item.type + '</strong> <small>' + item.date + '</small>' +
        '<pre>' + item.summary + '</pre>' +
        '</div>'
    ).join("");
}

function clearHistory() {
    if (confirm("Clear all split history?")) {
        localStorage.removeItem("splitHistory");
        loadHistory();
    }
}

if (document.getElementById("historyList")) {
    loadHistory();
}
