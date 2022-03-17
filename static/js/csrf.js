// csrf认证相关

function get_csrf_token() {
    return document.getElementsByName('csrfmiddlewaretoken')[0].value
}
