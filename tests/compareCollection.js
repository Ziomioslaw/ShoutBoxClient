function compareCollection(olds, news, fadd, fedit, fdelete) {
    var indexOfOld = 0;
    var maxOlds = olds.length;
    var ignore = true;

    news.forEach(compareItem);

    function compareItem(newShout) {
        var oldShout;
        if (indexOfOld >= maxOlds) {
            fadd(newShout);
            return;
        }

        oldShout = olds[indexOfOld];
        if (oldShout.id == newShout.id) {
            if (oldShout.message != newShout.message) {
                fedit(newShout);
            }

            indexOfOld++;
        } else if (oldShout.id < newShout.id) {
            if (!ignore) {
                fdelete(oldShout);
            }

            indexOfOld++;
            compareItem(newShout);
            return;
        }

        ignore = false;
        return;
    }
}

function unitTest() {
    var olds, news, additional = [], editied = [], deleted = [];
    var result = {
        setOlds: function(collection) {
            olds = remapCollection(collection);
            return result;
        },
        setNews: function(collection) {
            news = remapCollection(collection);
            return result;
        },
        run: function() {
            compareCollection(olds, news,
                function (shout) { additional.push(shout.id); },
                function (shout) { editied.push(shout.id); },
                function (shout) { deleted.push(shout.id); }
            );
            return result;
        },
        expectedDeleted: function(collection) {
            try {
                compare(deleted, collection);
            } catch (e) {
                throw 'Deleted' + e;
            }
            return result;
        },
        expectedAddition: function(collection) {
            try {
                compare(additional, collection);
            } catch (e) {
                throw 'Additional' + e;
            }
            return result;
        },
        expectedEditied: function(collection) {
            try {
                compare(editied, collection);
            } catch (e) {
                throw 'Editied' + e;
            }
            return result;
        },
    };

    return result;

    function remapCollection(collection) {
        return collection.map(function(item) {
            return { id: item, message: 'message ' + item + ' text' };
        });
    }

    function compare(collection, expected) {
        if (collection.length !== expected.length) {
            console.log('Excepted: ', expected);
            console.log('Reviced:  ', collection);

            throw ' collection incorrect: exptecting: ' + expected.length + ', recived: ' + collection.length;
        }

        expected.forEach(function(item, index) {
            if (collection[index] !== item) {
                throw ' collection item on index ' + index + ' is different that excepted';
            }
        });
    }
}

(new unitTest())
    .setOlds([1,2,3,4])
    .setNews(  [2,3,4,5])
    .run()
    .expectedDeleted([])
    .expectedAddition([5])
    .expectedEditied([]);

(new unitTest())
    .setOlds([1,2,3,4])
    .setNews(  [2,  4,5,6])
    .run()
    .expectedDeleted([3])
    .expectedAddition([5,6])
    .expectedEditied([]);

(new unitTest())
    .setOlds(  [2,3,4,5])
    .setNews([1,2,3,  5])
    .run()
    .expectedDeleted([4])
    .expectedAddition([])
    .expectedEditied([]);
