module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); //try implied when fn(req,res,next) executed, .catch implies next need to be executed with the error so just next
    }
}