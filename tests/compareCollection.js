// core.js
function compareCollection(olds, news, fadd, fedit, fdelete) {
    var indexOfOld = 0;
    var maxOlds = olds.length;
    var ignore = true;

    news.forEach(compareItem);
    olds.slice(indexOfOld).forEach(fdelete);

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

function unitTest(name) {
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
            console.log('Actual: ' + olds.map(function(shout) { return shout.id }));
            console.log('New:    ' + news.map(function(shout) { return shout.id }));

            compareCollection(olds, news,
                function (shout) { additional.push(shout.id); },
                function (shout) { editied.push(shout.id); },
                function (shout) { deleted.push(shout.id); }
            );
            return result;
        },
        expectedDeleted: function(collection) {
            try {
                compare('Deleted', deleted, collection);
            } catch (e) {
                throw 'Deleted' + e;
            }
            return result;
        },
        expectedAddition: function(collection) {
            try {
                compare('Additional', additional, collection);
            } catch (e) {
                throw 'Additional' + e;
            }
            return result;
        },
        expectedEditied: function(collection) {
            try {
                compare('Editied', editied, collection);
            } catch (e) {
                throw 'Editied' + e;
            }
            return result;
        },
    };

    console.log('TEST: ' + name);

    return result;

    function remapCollection(collection) {
        return collection.map(function(item) {
            return { id: item, message: 'message ' + item + ' text' };
        });
    }

    function compare(name, collection, expected) {
        try {
            if (collection.length !== expected.length) {
                throw ' collection incorrect: exptecting: ' + expected.length + ', recived: ' + collection.length;
            }

            expected.forEach(function(item, index) {
                if (collection[index] !== item) {
                    throw ' collection item on index ' + index + ' is different that excepted';
                }
            });

            console.log(name + ' correct');
        }
        catch (ex) {
            console.log(name);
            console.log('Excepted: ', expected);
            console.log('Reviced:  ', collection);
            throw ex;
        }
    }
}

(new unitTest('Only additional'))
    .setOlds([1,2,3,4])
    .setNews(  [2,3,4,5])
    .run()
    .expectedDeleted([])
    .expectedAddition([5])
    .expectedEditied([]);

console.log('\n --- \n');

(new unitTest('Deleted and excepted'))
    .setOlds([1,2,3,4])
    .setNews(  [2,  4,5,6])
    .run()
    .expectedDeleted([3])
    .expectedAddition([5,6])
    .expectedEditied([]);

console.log('\n --- \n');

(new unitTest('Only deleted'))
    .setOlds(  [2,3,4,5])
    .setNews([1,2,3,  5])
    .run()
    .expectedDeleted([4])
    .expectedAddition([])
    .expectedEditied([]);

console.log('\n --- \n');

(new unitTest('Last shout deleted'))
    .setOlds(  [2,3,4,5])
    .setNews([1,2,3,4])
    .run()
    .expectedDeleted([5])
    .expectedAddition([])
    .expectedEditied([]);

console.log('\n --- \n');

(new unitTest('More last shout deleted'))
    .setOlds(  [2,3,4,5,6,7])
    .setNews([1,2,3,4])
    .run()
    .expectedDeleted([5,6,7])
    .expectedAddition([])
    .expectedEditied([]);
