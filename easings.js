const easeInQuint = function (x) {
    return Math.pow(x, 5);
}

const easeOutQuint = function (x) {
    return 1 - Math.pow(1 - x, 5);
}

const easeInOutQuint = function (x) {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

const easeInSine = function (x) {
    return 1 - Math.cos((x * Math.PI) / 2);
}

const easeOutSine = function (x) {
    return Math.sin((x * Math.PI) / 2);
}

const easeInOutSine = function (x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

const easeInCubic = function (x) {
    return x * x * x;
}

const easeOutCubic = function (x) {
    return 1 - Math.pow(1 - x, 3);
}

const easeInOutCubic = function (x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

const easeInQuad = function (x) {
    return x * x;
}

const easeOutQuad = function (x) {
    return 1 - (1 - x) * (1 - x);
}

const easeInOutQuad = function (x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

const easeInCirc = function (x) {
    return 1 - Math.sqrt(1 - Math.pow(x, 2));
}

const easeOutCirc = function (x) {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

const easeInOutCirc = function (x) {
    return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

const easeInElastic = function (x) {
    const c4 = (2 * Math.PI) / 3;
    return x == 0
        ? 0
        : x == 1
            ? 1
            : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
}

const easeOutElastic = function (x) {
    const c4 = (2 * Math.PI) / 3;
    return x == 0
        ? 0
        : x == 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

const easeInOutElastic = function (x) {
    const c5 = (2 * Math.PI) / 4.5;

    return x == 0
        ? 0
        : x == 1
            ? 1
            : x < 0.5
                ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}

const easings = [easeInQuint, easeOutQuint, easeInOutQuint,
    easeInSine, easeOutSine, easeInOutSine,
    easeInCubic, easeOutCubic, easeInOutCubic,
    easeInQuad, easeOutQuad, easeInOutQuad,
    easeInCirc, easeOutCirc, easeInOutCirc,
    /*easeInElastic, easeOutElastic, easeInOutElastic*/];