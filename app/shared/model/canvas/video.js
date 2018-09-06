const fabric = require('fabric').fabric;

fabric.Video = fabric.util.createClass(fabric.Image, {
    type: 'video',

    initialize: function (objects, options) {
        options || (options = {});

        this.callSuper('initialize', objects, options);
        this.set('videoId', options.videoId || 'undefinedVideoId');
        this.set('videoTime', options.videoTime || 0);
    },

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            videoId: this.get('videoId'),
            videoTime: this.get('videoTime')
        });
    },

    _render: function (ctx) {
        this.callSuper('_render', ctx);
    }
});

fabric.Video.fromObject = function (object, callback) {
    let _enlivenedObjects;
    fabric.util.enlivenObjects(object.objects, function (enlivenedObjects) {
        delete object.objects;
        _enlivenedObjects = enlivenedObjects;
    });
    return new fabric.Video(_enlivenedObjects, object);
};