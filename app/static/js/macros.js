("input#save").click(function(e) {
    e.preventDefault();
    var url = "/macros/" + $(".macro-card form").id + "/edit"
    $.ajax({
        type: "POST",
        url: url,
        data: {
            id: $(this).val(), // < note use of 'this' here
            access_token: $("#access_token").val()
        },
        success: function(result) {
            alert('ok');
        },
        error: function(result) {
            alert('error');
        }
    });
});
