// Import contact model
const Contact = require('../model/contactModel');
const redisClient = require("../redis");

const DEFAULT_EXPIRATION = 3600;
// Handle index actions
exports.index = function (req, res) {
    Contact.get(function (err, contacts) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "Contacts retrieved successfully",
            data: contacts
        }).status(200);
    });
};
// Handle create contact actions
exports.new = function (req, res) {
    var contact = new Contact();
    contact.name = req.body.name ? req.body.name : contact.name;
    contact.gender = req.body.gender;
    contact.email = req.body.email;
    contact.phone = req.body.phone;
    if (contact.name && contact.email) {


        // save the contact and check for errors
        contact.save(function (err) {
            // if (err)
            //     res.json(err);
            res.json({
                message: 'New contact created!',
                data: contact
            }).status(200);
        });
    } else {
        res.status(401).json({
            message: 'Missing name or email!',
        });
    }

};
// Handle view contact info
exports.view = function (req, res) {
    Contact.findById(req.params.contact_id, function (err, contact) {
        if (err)
            res.send(err);
        res.json({
            message: 'Contact details loading..',
            data: contact
        });
    });
};
// Handle update contact info
exports.update = function (req, res) {
    console.log(req.params.contact_id);
    Contact.findById(req.params.contact_id, function (err, contact) {
        if (err)
            res.send(err);
        contact.name = req.body.name ? req.body.name : contact.name;
        contact.gender = req.body.gender;
        contact.email = req.body.email;
        contact.phone = req.body.phone;
        // save the contact and check for errors
        contact.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'Contact Info updated',
                data: contact
            }).status(200);
        });
    });
};
// Handle delete contact
exports.delete = function (req, res) {
    Contact.remove({
        _id: req.params.contact_id
    }, function (err, contact) {
        if (err)
            res.send(err);
        res.json({
            status: "success",
            message: 'Contact deleted'
        }).status(200);
    });
};

exports.post = (req, res) => {
    const data = new Contact();
    data.id = req.body.id;
    data.first_name = req.body.first_name;
    data.last_name = req.body.last_name;
    data.email = req.body.email;
    data.gender = req.body.gender;
    data.save();
    res.sendStatus(201);
  };
  
  exports.get = (req, res) => {
    console.log("Cache miss");
    Contact.get(function (err, data) {
      if (err) {
        res.json({
          status: "error",
          message: err,
        });
        return;
      }
      redisClient.set("data", JSON.stringify(data), { EX: DEFAULT_EXPIRATION });
      res.json(data);
    });
  };