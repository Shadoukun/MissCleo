$(document).ready(function() {

    linkPreview();

    $("#sidebar").on('click', '.user', function(event) {
        event.preventDefault();
        var id = $(this).attr("id")
        var user_card = $(".users-card")

        $.ajax({
            url: $(this).attr("href"),
            success: function(data) {
                var newpage = $(data).find("#page");
                var users = $(data).find(".users-card");
                $("#page").replaceWith(newpage);
                $(user_card).replaceWith(users);
                linkPreview();

            }
        });
});

    $("#sidebar").on('click', '.remove-link', function(event) {
        event.preventDefault();
        var user_card = $(".users-card")

        $.ajax({
            url: $(this).attr("href"),
            success: function(data) {
                var newpage = $(data).find("#page");
                var users = $(data).find(".users-card");
                $("#page").replaceWith(newpage);
                $(user_card).replaceWith(users);
                linkPreview();

            }
        });

    });
});
