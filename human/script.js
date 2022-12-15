const headArr = ["./h_assets/h_head1.svg", "./h_assets/h_head2.svg", "./h_assets/h_head3.svg", "./h_assets/h_head4.svg", "./h_assets/h_head5.svg"]
const quotesArr = ["./h_assets/h_quote1.svg", "./h_assets/h_quote2.svg", "./h_assets/h_quote3.svg", "./h_assets/h_quote4.svg", "./h_assets/h_quote5.svg"];
const huMan = document.querySelector(".hu-man");
const hHead = document.querySelector(".h-head");
const hQuote = document.querySelector(".h-quote");

let headId = headArr.length;
let quoteId = quotesArr.length;

function randomElem(arr, elem) {
    const rI = Math.floor(Math.random() * arr.length);
    elem.src = arr[rI];
}

function nextHead() {
    headId++;
    if (headId >= headArr.length) headId = 0;
    return hHead.src = headArr[headId]
}

function nextQuotes() {
    quoteId++;
    if (quoteId >= quotesArr.length) quoteId = 0;
    return hQuote.src = quotesArr[quoteId]
}

randomElem(headArr, hHead);
randomElem(quotesArr, hQuote);

huMan.addEventListener("click", () => { nextHead(); nextQuotes(); })