// ---------- CONFIG ----------
const STORAGE_KEY = "autocompleteData"; // מפתח מרכזי ל-localStorage

// ---------- פונקציות ניהול נתונים ----------
function loadData() {
    let data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// מוסיף ערך ל-recent אם עוד לא קיים, ומעלה למעלה אם קיים
function addToAutocomplete(type, value) {
    value = value.trim();
    if (!value) return;
    let data = loadData();
    if (!data[type]) data[type] = [];
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

// ---------- AUTOCOMPLETE GMAIL-STYLE ----------
function initAutocomplete() {
    $("input[data-autocomplete-type]").each(function () {
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
            autoFocus: false,
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
            //$(this).autocomplete("search", $(this).val());
            if (!$(this).val()) {
                // אם השדה ריק, הראה את כל הרשימה
                $(this).autocomplete("search", "");
            }
        });
    });
}

// ---------- INIT PAGE ----------
$(function () {
    initAutocomplete();
});
