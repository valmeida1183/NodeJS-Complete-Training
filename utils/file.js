const fs = require('fs');
const path = require('path');

exports.deleteFile = filePath => {
    filePath = `${path.resolve('./')}${filePath}`;
    fs.unlink(filePath, err => {
        if (err) {
            throw new Error(err);
        }
    });
};
