context.TimeServer = function() {
    return {
        getNowTime: function() {
            return timeFormat(new Date());
        }
    };

    function timeFormat(time) {
        return ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2) + ':' + ('0' + time.getSeconds()).slice(-2);
    }
};
