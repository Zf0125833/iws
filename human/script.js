const headArr = ["./h_assets/h_head1.svg", "./h_assets/h_head2.svg", "./h_assets/h_head3.svg", "./h_assets/h_head4.svg", "./h_assets/h_head5.svg"];
const quotesArr = ["./h_assets/h_quote1.svg", "./h_assets/h_quote2.svg", "./h_assets/h_quote3.svg", "./h_assets/h_quote4.svg", "./h_assets/h_quote5.svg"];
const rotateArr = [" r-on", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "];
const huMan = document.querySelector(".hu-man");
const hHead = document.querySelector(".h-head");
const hQuote = document.querySelector(".h-quote");
const bgChange = document.querySelector(".bg-change");

function randomElem(arr, elem) {
    const rI = Math.floor(Math.random() * arr.length);
    elem.src = arr[rI];
}

function rRotate() {
    const rI = Math.floor(Math.random() * rotateArr.length);
    huMan.className += rotateArr[rI];
}

huMan.addEventListener("click", () => randomElem(headArr, hHead) ?? randomElem(quotesArr, hQuote));
bgChange.addEventListener("click", () => document.body.classList.toggle("on"));

randomElem(headArr, hHead) ?? randomElem(quotesArr, hQuote) ?? rRotate();

window.addEventListener("load", () => setTimeout(() => huMan.classList.add("load"), 1000))

// let headId = headArr.length;
// let quoteId = quotesArr.length;

// function nextHead() {
//     headId++;
//     if (headId >= headArr.length) headId = 0;
//     return hHead.src = headArr[headId]
// }

// function nextQuotes() {
//     quoteId++;
//     if (quoteId >= quotesArr.length) quoteId = 0;
//     return hQuote.src = quotesArr[quoteId]
// }
