import Inquiry from "../models/inquiry.js";
import { isItAdmin, isItCustomer } from "./userController.js";

export async function addInquiry(req,res){
    try{

        if(isItCustomer(req)){
            const data = req.body;
            data.email = req.user.email;
            data.phone = req.user.phone;

            let id = 0;

            const inquiries = await Inquiry.find().sort({id : -1}).limit(1);

            if(inquiries.length == 0){
                id = 1;
            }else{
                id = inquiries[0].id + 1;
            }

            data.id = id;

            const newInquiry = new Inquiry(data);
            const response = await newInquiry.save();

            res.json({
                message : "Inquiry added successfully", id : response.id
            });
        }

    }catch(e){
        res.status(500).json({error : "Failed to add inquiry"});
    }
}

export async function getInquiries(req,res){
    try{

        if(isItCustomer(req)){
            const inquiries = await Inquiry.find({email : req.user.email});
            res.json(inquiries);
            return;
        }else if(isItAdmin(req)){
            const inquiries = await Inquiry.find();
            res.json(inquiries);
            return;
        }else{
            res.status(403).json({error : "You are not authorized to perform this action"});
        }

    }catch(e){
        res.status(500).json({error : "Failed to get inquiries"});
    }
}

export async function deleteInquiry(req, res) {
    try {
      const id = req.params.id;
  
      if (isItAdmin(req)) {
        await Inquiry.deleteOne({ id: id });
        return res.json({ message: "Inquiry deleted successfully" });
      }
  
      if (isItCustomer(req)) {
        const inquiry = await Inquiry.findOne({ id: id });
  
        if (!inquiry) {
          return res.status(404).json({ error: "Inquiry not found" });
        }
  
        if (inquiry.email === req.user.email) {
          await Inquiry.deleteOne({ id: id });
          return res.json({ message: "Inquiry deleted successfully" });
        }
  
        return res.status(403).json({
          error: "You are not authorized to perform this action"
        });
      }
  
      // if neither admin nor customer
      return res.status(403).json({
        error: "You are not authorized to perform this action"
      });
  
    } catch (e) {
      res.status(500).json({ error: "Failed to delete inquiry" });
    }
  }

  export async function updateInquiry(req,res){
    try{

        if(isItAdmin(req)){
            const id = req.params.id;
            const data = req.body;
            await Inquiry.updateOne({id : id},data);
            res.json({message : "Inquiry updated successfully"});
        }else if(isItCustomer(req)){
            const id = req.params.id;
            const data = req.body;

            const inquiry = await Inquiry.findOne({id : id});

            if(inquiry == null){
                res.status(404).json({
                    error : "Inquiry not found"
                });
                return;

            }else{
                if(inquiry.email == req.user.email){

                    
                    await Inquiry.updateOne({id : id},{message : data.message});
                    res.json({
                        message : "Inquiry updated successfully"
                    });
                    return;

                }else{
                    res.status(403).json({
                        error : "You are not authorized to perform this action"
                    });
                    return;
                }
            }
        }else{
            res.status(403).json({
                error : "You are not authorized to perform this action"
            });
        }

    }catch(e){
        res.status(500).json({error : "Failed to update inquiry"});
    }
  }
  
