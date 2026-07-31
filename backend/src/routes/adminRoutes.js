const express =require("express");
const router =express.Router();
const mockAuth = require("../middleware/auth.middleware");

const{
    getAdminDashboard,
     getPendingVolunteers,
     approveVolunteer,
     rejectVolunteer
}= require("../controllers/admin.controllers");
router.get("/dashboard",getAdminDashboard);
router.get("/volunteers/pending",getPendingVolunteers);
router.put("/volunteers/:id/approve",
              mockAuth,
              approveVolunteer)
router.put("/volunteers/:id/reject",
            mockAuth,
             rejectVolunteer);
module.exports = router;