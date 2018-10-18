class DomUtils {

    static htmlToElement(html, cssClass, id) {
        let template = document.createElement('div');
        if (cssClass) template.classList.add(cssClass);
        if (id) template.id = id;
        template.innerHTML = html;
        return template;
    }
}

module.exports = DomUtils;