'use strict';


class HtmlElement
{

    static AddChild(parent_html_element, html_element, next_html_element = null)
    {
        // console.log(parent_html_element, html_element, next_html_element);

        if (next_html_element === null)
            parent_html_element.appendChild(html_element);
        else
            parent_html_element.insertBefore(html_element, next_html_element);
    }

    static RemoveChild(parent_html_element, html_element)
    {
        parent_html_element.removeChild(html_element);
    }

}

module.exports = HtmlElement;
