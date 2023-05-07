from time import sleep
import time
from flask import Flask, make_response, jsonify, request
from functions import *
from ner import *
from sc import *
from sc_train import *
from model import User, db, user_datastore, Security
from flask_cors import CORS
from flask_login import current_user
from flask_restful import Api, Resource
from flask_security import auth_required, logout_user
import hashlib
import json
import datetime
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'
app.secret_key = '38eyhdasjhy83e29qo8esdksan235e283ieqwiy2893'
app.config['SQLALCHEMY_DATABASE_URI'] ='sqlite:///' + os.path.join(os.getcwd(), 'backend', 'database.sqlite')
app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
app.config['WTF_CSRF_ENABLED'] = False
app.config['SECURITY_PASSWORD_SALT'] = 'dsaugdsanevwqydfbsa'

api = Api(app)
security = Security(app, user_datastore)
db.init_app(app)
app.app_context().push()

class UserDetails(Resource): #done
    def get(self):
        user = User.query.filter(User.id == current_user.id).first()
        return make_response(jsonify({'user' : user.name,
                                      'profile_pic': user.profile_pic}), 200)

class Signup(Resource) : #done
    def post(self) :
        data = request.get_json()
        user = User.query.filter(User.email == data["email"]).first()
        if user :
            return make_response(jsonify({'msg' : 'Email id already in use'}), 201)
        else :
            try :
                email_ = data['email'].encode('utf-8')
                
                new_user = User(email = email_,
                                password = data["password"],
                                name = data["name"],
                                profile_pic = "default",
                                gender = int(data["gender"]),
                                location = int(data["location"]),
                                active = True,
                                fs_uniquifier = hashlib.md5(email_).hexdigest(),
                                dob = data["dob"])

                db.session.add(new_user)
                db.session.commit()

                return make_response(jsonify({'msg' : 'Successfully signed up!'}), 200)
            except :
                return make_response(jsonify({'msg' : 'Oops some error occurred!'}), 400)
 
class Upload(Resource): #done
    def post(self):

        global text # for passing textract output to the frontend
        global current_file

        image = request.files['image']
        temp = os.listdir("backend/image")
        temp = sorted(list(map(int,[t.split("_")[1].split(".")[0] for t in temp])))
        if len(temp) == 0:
            last_num = 0
        else:
            last_num = temp[-1]
        image.save(f"backend/image/prediction_{last_num+1}.jpeg")
        text = detectText(f"backend/image/prediction_{last_num+1}.jpeg")
        current_file = "backend/image/prediction_"+str(last_num+1)+".jpeg"
        with open("backend/model/datasets/NERData/temp.txt", "w") as f:
            f.write(text.strip().replace(" ", " -X- -X- O\n") + " -X- -X- O")
            f.write("\n")
        
class Annotate(Resource):
    # @auth_required("token")
    def get(self) :

        # return the NER result only
        sleep(5)
        ner_model.load_model()
        dic = ner_model.predict(text)
        print(dic)
        return make_response(jsonify({'msg' : text, 'file': current_file, 'dic': dic}), 200)

    # @auth_required("token")
    def post(self):
        try:
            data = request.get_json()

            NERData = data["NERData"]
            Category = data["Category"]
            CorrectedData = data["CorrectedData"]

            NERDataFlatten = []
            CategoryFlatten = []

            for i in range(len(NERData)):
                temp = NERData[i].split(" ")
                NERDataFlatten.extend(temp)
                CategoryFlatten.extend([Category[i] for _ in range(len(temp))])

            count = 0
            CategoryDic = { "0": "Medicine",
                            "1": "Medical_condition",
                            "2": "Diagnostic_test",
                            "3": "Frequency",
                            "4": "Name",
                            "5": "Date"
                        }

            file = open("backend/model/datasets/NERData/temp.txt", "r")
            with open("backend/model/datasets/NERData/NERDataset.txt", "a") as f:
                f.write("-DOCSTART- -X- -X- O\n\n")
                previous_cat = None
                for line in file.readlines():
                    if (count < len(NERDataFlatten)):
                        if line.split(" ")[0] == NERDataFlatten[count]:
                            l_ = line.split(" ")
                            if CategoryDic[CategoryFlatten[count]] == previous_cat:
                                l_[-1] = "I-"+previous_cat+"\n"
                            else:
                                l_[-1] = "B-"+CategoryDic[CategoryFlatten[count]]+"\n"
                            line = " ".join(l_)
                            count += 1
                    f.write(line)
                    previous_cat = line.split(" ")[-1]
                    if "-" in previous_cat:
                        previous_cat = previous_cat.split("-")[1].split("\n")[0]
                f.write("\n")

            with open("backend/model/datasets/SCData/Medicine.txt", "a") as med:
                with open("backend/model/datasets/SCData/Medicine.txt", "a") as nonmed:
                    for idx in range(len(CorrectedData)):
                        if CategoryDic[Category[idx]] == "Medicine":
                            med.write(CorrectedData[idx])
                        if CategoryDic[Category[idx]] == "Medical_condition" or CategoryDic[Category[idx]] == "Diagnostic_test" or CategoryDic[Category[idx]] == "Frequency": 
                            nonmed.write(CorrectedData[idx])

            
            #add the code to update sc dataset
            return make_response(jsonify({'msg' : "Successfully annotated!!!"}), 200)

        except:
            return make_response(jsonify({'msg' : "Some error occurred while trying to annotate the prescription"}), 201)

class SavedFiles(Resource): #done
    # @auth_required("token")
    def get(self):
        prescriptions = [file.split(".")[0] for file in os.listdir("backend/image")]
        date = [time.ctime(os.path.getctime(f"backend/image/{prescription}.jpeg")) for prescription in prescriptions]
        dates = [" ".join(d.split(" ")[1:3])+" "+d.split(" ")[-1]+" "+d.split(" ")[3] for d in date]
        
        return make_response(jsonify({'prescriptions' : prescriptions,
                                      'date': dates}), 200)

class DeleteFile(Resource): #done
    # @auth_required("token")
    def get(self, name):
        try:
            os.remove("backend/image/"+name+".jpeg")
            return make_response(jsonify({'msg': "Successfully removed "+name}), 200)
        except:
            return make_response(jsonify({'msg': "Some error occurred while trying to delete "+name}), 201)

class AnnotateFile(Resource): #done
    # @auth_required("token")
    def get(self, name):

        global text
        global current_file

        text = detectText("backend/image/"+name+".jpeg")
        current_file = "backend/image/"+name+".jpeg"
        with open("backend/model/datasets/NERData/temp.txt", "w") as f:
            f.write(text.strip().replace(" ", " -X- -X- O\n") + " -X- -X- O")
            f.write("\n")

class Train(Resource): #done
    def get(self, model=None) :
        if model == None:
            try:
                ner_model.train_model("backend/model/datasets/NERData/NERDataset.txt", "backend/model/trained_model/NERModel")
                return make_response(jsonify({'msg': "NER Model trained successfully!!!"}), 200)
            except:
                return make_response(jsonify({'msg': "Some error occurred while trying to train the model"}), 201)
        elif model == "SCMed":
            try:
                sc_model = trainer("backend/model/datasets/SCData/Medicine.txt")
                sc_model.train_model("backend/model/trained_model/SCModel")
                return make_response(jsonify({'msg': "SC Medicine model trained successfully!!!"}), 200)
            except:
                return make_response(jsonify({'msg': "Some error occurred while trying to train the model"}), 201)
        elif model == "SCNonMed":
            try:
                sc_model = trainer("backend/model/datasets/SCData/NonMed.txt")
                sc_model.train_model("backend/model/trained_model/SCModel")
                return make_response(jsonify({'msg': "SC Non-Medicine model trained successfully!!!"}), 200)
            except:
                return make_response(jsonify({'msg': "Some error occurred while trying to train the model"}), 201)

class Result(Resource):
    def get(self) :

        # return the NER result only
        sleep(5)
        ner_model.load_model()
        dic = ner_model.predict(text)
        print(dic)
        NonMedData = []
        MedData = []
        for key in dic.keys():
            if key == "Medical_condition" or key == "Diagnostic_test" or key == "Frequency":
                for i in range(len(dic[key])):
                    NonMedData.append(dic[key][i][0])
            elif key == "Medicine":
                for i in range(len(dic[key])):
                    MedData.append(dic[key][i][0])
        CorrectedNonMedData = sc_nonmed_model.correct_spelling(" ".join(NonMedData)).split(" ")
        CorrectedMedData = sc_medicine_model.correct_spelling(" ".join(MedData)).split(" ")

        for i in range(len(CorrectedMedData)):
            dic["Medicine"][i][0] = CorrectedMedData[i]

        idx = 0
        key_idx = 0
        for key in dic.keys():
            if key == "Medical_condition" or key == "Diagnostic_test" or key == "Frequency":
                if  idx != len(CorrectedNonMedData):
                    while key_idx < len(dic[key]):
                        dic[key][key_idx][0] = CorrectedNonMedData[idx]
                        idx+=1
                        key_idx+=1
                    key_idx%=len(dic[key])

        return make_response(jsonify({'msg' : text, 'file': current_file, 'dic': dic}), 200)

class Logout(Resource): #done
    @auth_required("token")
    def get(self):
        logout_user()
        return make_response(jsonify({'msg': "Successfully logged out!!!"}), 200)

api.add_resource(UserDetails, '/api/user') #done
api.add_resource(Signup, '/api/signup') #done
api.add_resource(Upload, '/api/upload') #done
api.add_resource(Annotate, '/api/annotate') 
api.add_resource(SavedFiles, '/api/savedfiles') #done
api.add_resource(DeleteFile, '/api/deletefile/<name>') #done
api.add_resource(AnnotateFile, '/api/annotatefile/<name>') #done
api.add_resource(Train, '/api/train/<model>', '/api/train') #done
api.add_resource(Result, '/api/result') #done
api.add_resource(Logout, '/api/logout') #done


 
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
