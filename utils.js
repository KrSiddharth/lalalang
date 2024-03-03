function randomNoRepeats(array) {
    var copy = array.slice(0);
    return function () {
        if (copy.length < 1) { copy = array.slice(0); }
        var index = Math.floor(Math.random() * copy.length);
        var item = copy[index];
        copy.splice(index, 1);
        return item;
    };
}

function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
}

const getEle = (selector, returnFirstEle = false) => {
    if (selector.startsWith('#') || returnFirstEle) {
        const elements = document.querySelector(selector);
        return elements;
    }

    const elements = document.querySelectorAll(selector);
    if(elements[0]) {
        return elements;
    } else {
        console.log("couldn't find the element ", selector)
    }
}