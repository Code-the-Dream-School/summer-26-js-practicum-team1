
const prisma = require("../config/prisma")
async function getAdminDashboard(req,res){
    try {
        const totalUsers =await prisma.user.count();
        const pendingVolunteers =await prisma.volunteerProfile.count({
            where:{
                verificationStatus:"PENDING"
            }
        });
        const totalRequesters =await prisma.user.count({
            where: {
                role:"REQUESTER"
            }
        });
        const totalVolunteers =await prisma.user.count({
            where:{
                role:"VOLUNTEER"
            }
        });
        res.status(200).json({
            totalUsers,
            totalRequesters,
            totalVolunteers,
            pendingVolunteers
        });
    }catch (error){
        console.error(error);
        res.status(500).json({
            message:"server error"
        })
    }
}
async function getPendingVolunteers(req,res) 
{ 
    try {
    const pendingVolunteers =await prisma.volunteerProfile.findMany({
        where:{
            verificationStatus: "PENDING"
        },
        include:{
            user:{
                select:{
                    id:true,
                    name: true,
                    email:true,
                    phone:true,
                    dob:true,
                    gender:true,
                    profileImage:true
                }
            }
        }
    });res.status(200).json({
        pendingVolunteers
    });


}
catch (error){
    console.error ("Error fetching pending volunteers:", error);
    res.status(500).json({
        message: "Server error"
    });
}
    
}
async function approveVolunteer(req,res){
    try{
        const volunteerId=Number (req.params.id);
        const adminId =req.user.id;
        const volunteerProfile =await prisma.volunteerProfile.findUnique({
            where:{
                userId:volunteerId
            }
        });
        if(!volunteerProfile){
            return res.status(404).json({
                message:"Volunteer profile not found"
            });
        }
        if(volunteerProfile.verificationStatus!== "PENDING"){
            return res.status(400).json({
                message:"Volunteer request is already approved or rejected"
            })
        }
    await prisma.$transaction([
  prisma.volunteerProfile.update({
    where: {
      userId: volunteerId
    },
    data: {
      verificationStatus: "APPROVED"
    }
  }),

  prisma.volunteerVerification.create({
    data: {
      volunteerId: volunteerId,
      status: "APPROVED",
      reviewedBy: adminId,
      notes: "Approved by admin"
    }
  })
]);
res.status(200).json({
    message:"Volunteer approved successfully"
});
    } catch (error){
        console.error("Error approving volunteer:", error);
        res.status(500).json({
      message: "Server error"
    });
    }
}
async function rejectVolunteer(req, res) {
  try {
    const volunteerId = Number(req.params.id);
    const adminId = req.user.id;
    

    const volunteerProfile = await prisma.volunteerProfile.findUnique({
      where: {
        userId: volunteerId
      }
    });

    if (!volunteerProfile) {
      return res.status(404).json({
        message: "Volunteer profile not found"
      });
    }

    if (volunteerProfile.verificationStatus !== "PENDING") {
      return res.status(400).json({
        message: "Volunteer request has already been reviewed"
      });
    }

    await prisma.$transaction([
      prisma.volunteerProfile.update({
        where: {
          userId: volunteerId
        },
        data: {
          verificationStatus: "REJECTED"
        }
      }),

      prisma.volunteerVerification.create({
        data: {
          volunteerId: volunteerId,
          status: "REJECTED",
          reviewedBy: adminId,
          notes: "Rejected by admin"
        }
      })
    ]);

    res.status(200).json({
      message: "Volunteer rejected successfully"
    });

  } catch (error) {
    console.error("Error rejecting volunteer:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
}
module.exports={
   getAdminDashboard,
   getPendingVolunteers,
   approveVolunteer,
   rejectVolunteer

}