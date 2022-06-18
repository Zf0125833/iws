// document.addEventListener('contextmenu', e => e.preventDefault());

const prldr = document.querySelector('.pr--r');
prldr.innerHTML = '<div class="pr--r_inner"></div><div class="pr--r-a"><span class="pr--1"></span><span class="pr--2"><span></span></span></div>';
const prldrA = document.querySelector('.pr--r-a');
const linkTop2 = document.querySelector('.l--go');
const nBtn = document.querySelector('.nav--btn');
const tr1 = document.querySelector('.tr--1');
const hQuote = document.querySelector('.h--quote');
const pageNavScrl = document.querySelector('.page-nav-scrl');
const removeTransitions = [tr1, hQuote];

if (tr1) { removeTransitions.map(i => i.style.transition = 'none');}

const img = document.images;
// const scrpt = document.scripts;
(img_tc = img.length),
    (img_lc = 0),
    (pers_d = document.querySelector(".pr--r_inner"));

for (let i = 0; i < img_tc; i++) {
    img_cl = new Image();
    img_cl.onload = img_ld;
    img_cl.onerror = img_ld;
    img_cl.src = img[i].src;
}

function img_ld() {
    img_lc++;
    let load_i = ((100 / img_tc) * img_lc) << 0;
    pers_d.innerHTML = load_i; // + " %";

    if (img_lc >= img_tc) {
        setTimeout(() => {
            pers_d.style.opacity = '0';
            pers_d.style.transform = 'translateY(5vh) scale(.6)';
            pers_d.style.transition = '.7s ease';
            document.querySelector('#root').classList.remove('v-hddn');
            prldrA.classList.add('prldr-b');
        }, 200);
        setTimeout(() => {
            document.body.classList.remove('fixed-b');
            prldrA.classList.add('prldr-a');
        }, 1100);
        if (tr1) {
            const actH = document.querySelector('.act-h');
            const nBttlinkTop2 = [nBtn, linkTop2];
            tr1.style.transform = "translateY(70%)";
            tr1.style.opacity = 0;
            hQuote.style.transform = "translateX(50%)";
            hQuote.style.opacity = 0;
            nBttlinkTop2.map(i => {
                i.style.opacity = 0;
                i.style.transform = "translateY(-4vh)";
            });
            setTimeout(() => {
                removeTransitions.map(i => i.style.transition = '1.6s cubic-bezier(0, 0, 0.2, 1) 0s');
                hQuote.style.opacity = 1;
                hQuote.style.transform = "translateX(0%)";
            }, 1900);
            setTimeout(() => {
                tr1.style.opacity = 1;
                tr1.style.transform = "translateY(0%)";
            }, 2200);
            setTimeout(() => {
                linkTop2.style.opacity = 1;
                linkTop2.style.transform = "translateY(0)";
            }, 3000);
            setTimeout(() => {
                nBtn.style.opacity = 1;
                nBtn.style.transform = "translateY(0)";
            }, 3500);
        };
        if (pageNavScrl) {
            const scD = document.querySelector('.sc-d');
            const pageNavScrlscD = [scD, pageNavScrl]
            pageNavScrlscD.map(i => i.style.opacity = 0);
            setTimeout(() => {
                pageNavScrlscD.map(i => { i.style.opacity = 1; i.style.transition = "opacity .7s ease-out" });
            }, 5000);
        };
        setTimeout(() => {
            prldr.remove();
        }, 3550);
    }
};

// if (tr1) {
//     const pageNav = document.querySelector('.page-nav');
//     const pNavi = document.querySelector('.page-nav-a');
//     let pNaviWheel;
//     pNavi.style.opacity = 0;

//     window.addEventListener('wheel', event => {
//         if (event.pageY) {
//             window.clearTimeout(pNaviWheel);
//             pNavi.style.opacity = 1;
//             pNaviWheel = setTimeout(() => {
//                 pNavi.style.opacity = 0;
//             }, 3000);
//         }
//     });

//     pageNav.addEventListener('mouseenter', () => {
//         window.clearTimeout(pNaviWheel);
//         pNaviWheel = pNavi.style.opacity = 1;
//     });

//     pageNav.addEventListener('mouseleave', () => {
//         window.clearTimeout(pNaviWheel);
//         pNaviWheel = setTimeout(() => {
//             pNavi.style.opacity = 0;
//         }, 3000);
//     });
// }


function getCL(l, b) { let c = "padding:10px 35px 10px 11px; font-family: sans-serif; font-size:10px;color: #ffffff;"; let e = console.log(l, c + b); return e; } getCL("%c DEVELOPED", "background: #4da9c0"); getCL("%c BY", "background: #a0b900"); getCL("%c IVANWEBSTUDIO", "background: #da554b");