class Slide {
    constructor(id, name, type, jsonCanvasData, data) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.jsonCanvasData = jsonCanvasData;
        this.data = data;
    }

    static isImportedFromCanvas(slide) {
        if (slide != null)
            return slide.type === "canvas";
        else
            return false
    }

    static isLyricsSlide(slide) {
        if (slide != null)
            return slide.type === "lyrics";
        else
            return false
    }
}

module.exports = Slide;