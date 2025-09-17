// ---------- CONFIG ----------
const STORAGE_KEY = "autocompleteData"; // מפתח מרכזי ל-localStorage

// ---------- פונקציות ניהול נתונים ----------
function loadData() {
    let data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { name: [], mitzvah: [], paymentType: [] };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// מוסיף ערך ל-recent אם עוד לא קיים, ומעלה למעלה אם קיים
function addToAutocomplete(type, value) {
    value = value.trim();
    if (!value) return;
    let data = loadData();
    const idx = data[type].indexOf(value);
    if (idx !== -1) data[type].splice(idx, 1); // אם קיים, הסר מהמיקום הקודם
    data[type].unshift(value); // הוסף למעלה
    saveData(data);
}

// מחזיר רשימה לכל סוג
function getAutocompleteList(type) {
    const data = loadData();
    return data[type] || [];
}

// ---------- פונקציות לניהול רשימות בדף ניהול ----------
function renderList(type, listId) {
    const data = loadData();
    const $list = $(listId);
    $list.empty();
    data[type].forEach((item, index) => {
        $list.append(`<li>${item} <button onclick="removeItem('${type}', ${index})">❌</button></li>`);
    });
}

function addItem(type, inputId, listId) {
    const val = $(inputId).val().trim();
    if (!val) return;
    let data = loadData();
    if (!data[type].includes(val)) {
        data[type].push(val);
        saveData(data);
        renderList(type, listId);
    }
    $(inputId).val("");
}

function removeItem(type, index) {
    const data = loadData();
    data[type].splice(index, 1);
    saveData(data);
    if (type === "name") renderList(type, "#listNames");
    if (type === "mitzvah") renderList(type, "#listMitzvot");
    if (type === "paymentType") renderList(type, "#listPayments");
}

// ---------- AUTOCOMPLETE GMAIL-STYLE ----------
function initAutocomplete() {
    $("#addPaymentModal input.autocomplete").each(function () {
        const type = $(this).data("autocomplete-type");
        $(this).autocomplete({
            source: function (request, response) {
                const list = getAutocompleteList(type);
                const term = request.term.toLowerCase();
                const matches = list.filter(x => x.toLowerCase().includes(term));
                response(matches);
            },
            minLength: 0,
            delay: 100,
            autoFocus: true,
            select: function (event, ui) {
                $(this).val(ui.item.value);
                addToAutocomplete(type, ui.item.value);
                return false;
            },
            open: function () {
                const $ul = $(this).autocomplete("widget");
                $ul.hide().css({ opacity: 0, transform: "translateY(-5px)" }).slideDown(150).animate({ opacity: 1 }, { duration: 150 });
            }
        }).focus(function () {
            $(this).autocomplete("search", $(this).val());
        });
    });
}

// ---------- INIT PAGE ----------
$(function () {
    // דף ניהול
    if ($("#addMisPallel").length) {
        renderList("name", "#listNames");
        renderList("mitzvah", "#listMitzvot");
        renderList("paymentType", "#listPayments");

        $("#addMisPallel").on("click", () => addItem("name", "#newMisPallel", "#listNames"));
        $("#addMitzva").on("click", () => addItem("mitzvah", "#newMitzva", "#listMitzvot"));
        $("#addPayment").on("click", () => addItem("paymentType", "#newPayment", "#listPayments"));
    }

    // דף index.html - אתחול autocomplete לכל השדות במודאל
    if ($("#addPaymentModal").length) initAutocomplete();
});
