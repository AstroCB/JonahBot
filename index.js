const graph = require("fbgraph");
const fs = require("fs");
const config = require("./config");

graph.setAccessToken(config.access_token);
graph.setVersion("2.4");

graph.get("/SwarthmoreCollege?fields=posts", function(err, res) {
    if (err) return console.err(err);

    var posts = res.posts.data;
    fs.readFile("posts.json", function(err, data) {
        if (err) {
            data = JSON.stringify([]);
            fs.writeFileSync("posts.json", data);
        }
        try {
            var stored = JSON.parse(data);
        } catch (e) {
            var stored = [];
        }
        for (var i = 0; i < posts.length; i++) {
            if (!contains(stored, posts[i])) {
                stored.push(posts[i]);
                addComment(posts[i]);
            }
        }
        fs.writeFile("posts.json", JSON.stringify(stored));
    });
});

function contains(container, data) {
    for (var i = 0; i < container.length; i++) {
        if (container[i].id == data.id) {
            return true;
        }
    }
    return false;
}

function addComment(post) {
    var id = post.id;
    graph.get(`/${id}/comments`, function(err, data) {
        if (err) return console.error(err);

        var authors = data.data.map(function(comment) {
            return comment.from;
        });

        var op = {
            "id": config.commenterId
        };

        if (!contains(authors, op)) {
            // User has not commented
            var tagged = {
                "message": `@[${config.tagId}:Jonah Langlieb]`
            }
            graph.post(`/${id}/comments`, tagged, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Comment posted: " + data.id);
                }
            });
        }
    });
}
