function linkPreview() {
    $( ".quote-body" ).each(function( index ) {
        var content = $(this).text()

        var url_expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/gi
        var img_expression = /(https?:\/\/.*\.(?:png|jpg|jpeg))/gi
        var re_url = new RegExp(url_expression);
        var re_img = new RegExp(img_expression)

        if ( re_url.test(content) ) {
            var match = re_url.exec(content);
            var new_content = $('<a>').attr("href", content).text(content);

            $(this).text('');
            $(this).append(new_content);

            while ((match = re_url.exec(content)) != null) {
                if (re_img.test(match[0])) {
                    var container = $("<div>").addClass("embed_img");
                    img_link = $("<a>").attr("href", match[0])
                    img_link.append($("<img>").attr("src", match[0]))
                    container.append(img_link)
                    $(this).append(container);
                }
                else {

                    var $quote = $(this)

                    $.ajax({
                        url: 'http://unfurl.oroboro.com/unfurl?url=' + match[0].toString(),
                        type: 'get',
                        dataType: 'json',

                        success: function(result) {
                            var embed  = result
                            console.log(embed);

                            var $prev_img = $("<img>").addClass("preview-image");
                            $prev_img.attr("src", embed.icon);

                            var $inner = $("<div>")
                            $inner.append($("<div>").text(embed.title));
                            $inner.append($("<div>").text(embed.desc));
                            $inner.append($("<div>").attr("id", "domain").text(embed.domain));

                            var $container = $("<div>").addClass("embed");
                            $container.append($inner)
                            $container.append($prev_img);

                            $quote.append($container);

                        },
                        error: function(result) {
                            console.log(result);
                        }
                    });
                };
            };
        };
    });
};

$( document ).ready(function() {
    linkPreview();
});
