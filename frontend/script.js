const SideBar = Vue.component('sidebar',{
    template: `
    <div>
      <button type="button" style="margin-left:5%; margin-top:1%;" class="btn btn-light bg-white rounded-pill shadow-sm px-15 mb-4" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
        <i class="fa fa-bars"> </i>
        <small class="text-uppercase font-weight-bold" id="hamburger"><b><i class="bi bi-list" style="font-size: 28px;"></i></b></small>
      </button>
  
  <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasExampleLabel">Offcanvas</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">

      <div class="py-4 px-3 mb-4 bg-light">
        <div class="media d-flex align-items-center">
          <img :src="'backend/profile_pic/'+profile_pic+'.jpeg'" alt="profilepic" width="80" height="80" class="mr-3 rounded-circle img-thumbnail shadow-sm">
          <div class="media-body">
            <h4 class="m-0"> &nbsp; {{user}} </h4>
          </div>
        </div>
      </div>

      <ul class="nav flex-column bg-white mb-0">

      <li class="nav-item">
        <p class="nav-link text-dark">
          <i class="fa fa-th-large mr-3 text-primary fa-fw"> </i> <router-link :to="'/'+'dashboard'" class="nav-link active" aria-current="page" style="color:rgb(95, 95, 95); text-align: left;">Dashboard</router-link>
        </p>
      </li>

        <li class="nav-item">
          <p class="nav-link text-dark">
            <i class="fa fa-th-large mr-3 text-primary fa-fw"> </i> <router-link :to="'/'+'predict'" class="nav-link active" aria-current="page" style="color:rgb(95, 95, 95); text-align: left;">Scan</router-link>
          </p>
        </li>

        <li class="nav-item">
          <p class="nav-link text-dark">
            <i class="fa fa-th-large mr-3 text-primary fa-fw"> </i> <router-link :to="'/'+'savedfiles'" class="nav-link active" aria-current="page" style="color:rgb(95, 95, 95); text-align: left;">Annotate/Delete</router-link>
          </p>
        </li>

        <li class="nav-item">
          <p class="nav-link text-dark">
            <i class="fa fa-th-large mr-3 text-primary fa-fw"> </i> <a class="nav-link active" @click="train('NER')" aria-current="page" style="color:rgb(95, 95, 95); text-align: left;">Train NER</a>
          </p>
        </li>

        <li class="nav-item">
          <p class="nav-link text-dark">
            <i class="fa fa-th-large mr-3 text-primary fa-fw"> </i> <a class="nav-link active" @click="train('SCMed')" aria-current="page" style="color:rgb(95, 95, 95); text-align: left;">Train SC Med</a>
          </p>
        </li>

        <li class="nav-item">
          <p class="nav-link text-dark">
            <i class="fa fa-th-large mr-3 text-primary fa-fw"> </i> <a class="nav-link active" @click="train('SCNonMed')" aria-current="page" style="color:rgb(95, 95, 95); text-align: left;">Train SC NonMed</a>
          </p>
        </li>
        
        <li class="nav-item">
          <p class="nav-link text-dark">
            <i class="fa fa-th-large mr-3 text-primary fa-fw"> </i> <a class="nav-link active" @click="logout" aria-current="page" style="color:rgb(95, 95, 95); text-align: left;">Logout</a>
          </p>
        </li>

      </ul>

    </div>
  </div>
  </div>
    `,

    data: function() {
      return {
        user: "",
        profile_pic: ""
      }
    },

    methods: {
      logout: function() {
        fetch('http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/logout', {
          method: "GET",
          headers: {
            "Authentication-Token": localStorage.getItem("authentication_token")
          }
        }).then(res => {
          if (res.status === 200) {
            localStorage.removeItem("authentication_token");
              Swal.fire({
                icon: 'success',
                title: 'Successfully logged out!!!',
                showConfirmButton: false,
                timer: 2000
              })
          }
          function myLoop(r) {
            setTimeout(function() {
              r                  
            }, 2000)
          }
          myLoop(this.$router.push("/"));
          })
        },
        
        train: function(model) {
          if (model === "NER") {
            console.log(model)
            model = ""
            console.log(model)
          }
          fetch(`http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/train/${model}`, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      "Authentication-Token": localStorage.getItem("authentication_token")
                }
          })
        }
    },

    beforeMount() {
      if (localStorage.getItem("authentication_token")) {
        fetch('http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/user', {
          method: "GET",
          headers: {
            "Authentication-Token": localStorage.getItem("authentication_token")
          }
        }).then(res => res.json())
          .then(resp => {
            this.user = resp.user,
            this.profile_pic = resp.profile_pic
          })
      }
    }
})

const NavBar = Vue.component('nav-bar', {
    template: `
      <div>
        <nav class="navbar navbar-expand-lg fixed-top flex-md-nowrap p-0 shadows white2">
          <div class="container-fluid">
            <a class="navbar-brand" href="/">
                <img src="frontend/static/logo.png" alt="Bootstrap" width="170" height="40">
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    <router-link :to="'/'" class="nav-link active" aria-current="page" style="color:rgb(95, 95, 95);">Home</router-link>
                    <router-link :to="'/'+'about'" class="nav-link active" aria-current="page" style="color:rgb(95, 95, 95);">About</router-link>
                    <router-link :to="'/'+'contact'" class="nav-link active" aria-current="page" style="color:rgb(95, 95, 95);">Contact</router-link>
                </div>
            </div>
          </div>
        </nav>
      </div>    
    `
})

const Base = {
    template: `
    <div>

      <div v-if="!token">
        <nav-bar></nav-bar>
      </div>

      <div v-else>
        <sidebar></sidebar>
      </div>

      <router-view></router-view>
      
    </div>
    `,

    data: function() {
      return {
          token: localStorage.getItem("authentication_token")
      }
    }
}

const Homepage = {
    template: `
    <div>
    <section>
    <!--row 1 starts-->
         <div class="container row p-5"> 
    
           <div class="col-8">
             <br><br><br><br><br><br><br><br>
             <H1 style="margin-left: -50px; font-size:60px;"> Translate your handwritten <br> text into a readable format, <br> with Scan Plus+</H1>
             <p style="color:rgb(95, 95, 95); margin-left: -50px; font-size:20px; margin-top: 10px;"> Create and save your prescription from any device, anywhere.</p>
             <br>
             <form>
             <router-link to="/login" style="color:rgb(74, 105, 133);"> <button type="Submit" class="btn btn-light purple1 center" style="width:70px; margin-left: -50px">  <h4 style="font-size:15px; margin:3.5px; color:rgb(255, 255, 255);"> Login </h4> </button> </router-link>
             <router-link to="/predict" style="margin-left: 0px; color:rgb(74, 105, 133);"> <button type="Submit" class="btn btn-light white1 center" style="width:180px; margin-left: 40px; margin-top: -40px; border-color: #646464;">  <h4 style="font-size:15px; margin:4px; color:rgb(100, 55, 184);"> Go to Predict Online </h4> </button> </router-link>
             </form>
            <br>
            <p style="color:rgb(95, 95, 95); margin-left: -50px; font-size:15px; margin-top:10px;"> Don't have an account? <router-link to="/signup" style="color: rgb(100, 55, 184);"> Sign up for free </a> </router-link></p>
           </div>
    
           <div class="col-4">
             <h2> <div class="shiftleftimg"> <img src="frontend/static/home6.png" width="1600" height="700"> </div> </h2>
           </div>
    
         </div>
         </section>
    <!--row 1 ends-->
    
    
    
    <!--row 2 starts-->
    <div class="container"> 
      <div class="col"> <br> <br> <hr> </div>
    </div>
    <!--row 2 ends-->
    
    <!--row 3 starts-->
    
    <section v-show="!video">
    <div class="container"> 
    <div class="container py-5">
     
       <span class="badge text-bg-light block margin-auto"> <h4 style="font-size:15px; margin:3.5px; color:rgb(51, 51, 51);">Dr. Reddy's ScanPlus+</h4></span> 
      
    </div>
    <!--row 3 starts-->
    
    <!--row 4 starts-->
    
      <div class="col"> <h1 style="margin-left: 30px; font-size:60px; text-align:center;">Get your prescriptions digitalized. </h1></div>
      <p style="color:rgb(95, 95, 95); margin-left: 30px; font-size:20px; margin-top: 10px; text-align:center;"> Get your handwritten medical prescription into a readable format using our tool. </p>
      <br> <br> <br> 
      <a href="" style="margin-left: 30px; color:rgb(74, 105, 133);"> <button type="button" class="btn btn-light purple1 center block margin-auto" @click="embedded_video">  <h4 style="font-size:15px; margin:3.5px; color:rgb(255, 255, 255); text-align:center;"> <i class="bi bi-play-circle" style="font-size:17px;"></i> &nbsp How Does it Work? </h4> </button> </a>
      <br> <br> <br> <br> <br> <br> <br>  
    </div>
    </section>
    <section v-show="video">
    <br>
    
      <video width="1140" height="640" controls id="video">
        <source src="frontend/static/how_it_works.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video><button @click="embedded_video" style="margin-top:-40%;"><i class="bi bi-x-circle-fill" style="font-size:30px"></i></button>
    </section>
    
    
    <!--row 4 ends-->
    </div>
    `,

    data: function() {
        return {
            video: false
        }
    },
  
    methods: {
        embedded_video: function() {
            this.video = !this.video
            event.preventDefault()
            if (!this.video) {
            document.getElementById("video").pause()
            }
        }
    }
}

const About = {
    template: `
    <div>
    <section>
    <!--row 1 starts-->
 <div class="container row p-5"> 

   <div class="col-8">
     <br><br><br>
     <H1 style="margin-left: -40px; font-size:60px; margin-top:20px;"> Serving our community <br> with a smile. <img src="frontend/static/smiley.png" width="50" height="50"> </H1> 
     <p style="color:rgb(95, 95, 95); margin-left: -40px; font-size:20px; margin-top: 10px;"> Good health can't wait.</p>
     <br> 
     
     <form>

     <router-link :to="'/'+'contact'" @click.native="$router.go()" style="color:rgb(74, 105, 133);"> <button type="Submit" class="btn btn-light white1 center" style="width:130px; margin-left: -40px; border-color: #646464;">  <h4 style="font-size:15px; margin:4px; color:rgb(100, 55, 184);"> Contact Us </h4> </button> </router-link>
    </form>
    <br>
    <p style="color:rgb(95, 95, 95); margin-left: -40px; font-size:15px; margin-top: 10px;"> Don't have an account? <router-link to="/signup" style="color: rgb(100, 55, 184);"> Sign up for free </a> </router-link>
   </div>

   <div class="col-4 shiftimage3">
     <video width="852" height="480" autoplay muted loop>
        <source src="frontend/static/about.mp4" type="video/mp4">
        Your browser does not support the video tag.
     </video>
   </div>

 </div>
 </section>
<!--row 1 ends-->



<!--row 2 starts-->
<div class="container"> 
<div class="col"> <br> <br> <hr> </div>
</div>
<!--row 2 ends-->

<!--row 3 starts-->


<div class="container"> 
<div class="container py-5">

<span class="badge text-bg-light block margin-auto"> <h4 style="font-size:15px; margin:3.5px; color:rgb(51, 51, 51);">Dr. Reddy's ScanPlus+</h4></span> 

</div>
<!--row 3 starts-->

<!--row 4 starts-->
<div class="col"> <h1 style="margin-left: 0px; font-size:60px; text-align:center;">A skilled team you can rely on to care.
<br> 
You can be sure that your healthcare
<br>
team has your best interests at heart. </h1></div>
<br> <br> <br> <br>
<div class="row">
<div class="col"> 
<p style="color:rgb(95, 95, 95); margin-left: 30px; font-size:20px; margin-top: 10px; text-align:center;"> We are a pharmaceutical company committed to providing access to <br> affordable and innovative medicines. </p>
</div>
<div class="col"> 
<p style="color:rgb(95, 95, 95); margin-left: 0px; font-size:20px; margin-top: 10px; margin-right:15px;text-align:center;"> We\'ve been around a long time and 
    we\'re not going anywhere. </p>
</div>
<div class="col"> 
    <p style="color:rgb(95, 95, 95); margin-left: 0px; font-size:20px; margin-top: 10px; text-align:center;">We aspire to create an environment in which people can realise their full potential through work and continuous learning.</p>
</div>
</div>
<br> <br> <br> 
<router-link :to="'/'+'contact'" style="margin-left: 0px; color:rgb(74, 105, 133);"> <button type="Submit" class="btn btn-light purple1 center block margin-auto">  <h4 style="font-size:15px; margin:3.5px; color:rgb(255, 255, 255); text-align:center;"> Book Online </h4> </button> </router-link>
<br> <br> <br> <br> <br> <br> <br>  
</div>
<!--row 4 ends-->
    </div>
    `
}

const Contact = {
    template: `
    <div>
    <!--row 1 starts-->
    <div class="row p-5"> 

      <div class="col-5">
      <br><br><br><br><br>
        <div class="shiftleftimg2"> <img src="frontend/static/map1.jpg" height="500px" width="450px" > </div>
   
      </div>

      <div class="col-7">
      <br><br><br><br><br><br>
       <h1 style="font-size:60px; margin-right: 0px;
     margin-left: 140px; margin-top: 0px;"> Get in touch with us. </h1>
       <p style="color:rgb(95, 95, 95); font-size:20px; margin-top: 10px; margin-left:140px;"> Contact us in any way you choose.</p>
       
       <br> 
       <table style="margin-left:140px; margin-right:auto;"class="table table-borderless">
           <thead>
             
           </thead>
           <tbody>
             <tr>
               <th scope="row">Phone number</th>
               
               <td>1800 425 0014</td>
               
             </tr>
             <tr>
               <th scope="row">Email</th>
               
               <td>customerservices@drreddys.com</td>
               
             </tr>

             <tr>
               <th scope="row">Address</th>
               
               <td>Corporate Office Dr. Reddy's Laboratories Ltd. <br> 8-2-377 Road No. 3, Banjara Hills, Hyderabad <br> Telangana 500034, India </td>
               
             </tr>
             <tr>
               <th scope="row">Hours</th>
               <td>Monday - Friday 
                   8.00AM - 6.00PM</td>
             </tr>
           </tbody>
         </table>
        
      </div>

    </div>

<!--row 1 ends-->



<!--row 2 starts-->
<div class="container"> 
 <div class="col"> <br> <br> <hr> </div>
</div>


<!--row 2 ends-->

<!--row 3 starts-->
<section>

<!--row 4 ends-->

<div class="col-6">
   <br><br>
   <h1 style="font-size:60px; margin-left: 100px; margin-top:30px;"> Or ask us to get in touch with you. </h1>
   <p style="color:rgb(95, 95, 95); font-size:20px; margin-top: 10px; margin-left: 100px;"> Choose how you would like to hear from Dr. Reddy's.</p>
   <h2> <div class="shiftleftimg3"> <img src="frontend/static/phone.png" height="100px" weight="120px"> </div> </h2>

 </div>

 <div class="col-6">
   
  
   
   <br> <br> <br> 


   <form>
       <div class="mb-3 leftside">
         <label for="exampleInputEmail1" class="form-label">First Name</label>
         <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
       </div>
       <div class="mb-3 leftside">
         <label for="exampleInputPassword1" class="form-label">Last Name</label>
         <input type="text" class="form-control" id="exampleInputPassword1">
       </div>
       <div class="mb-3 leftside">
           <label for="exampleInputPassword1" class="form-label"> Phone </label>
           <input type="text" class="form-control" id="exampleInputPassword1">
         </div>
         <div class="mb-3 leftside">
           <label for="exampleInputPassword1" class="form-label"> Email</label>
           <input type="email" class="form-control" id="exampleInputPassword1">
         </div>
         <div class="mb-3 leftside">
           <label for="exampleFormControlTextarea1" class="form-label">Message</label>
           <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" style="min-height: 100px; max-height: 100px"></textarea>
         </div>

         
        <button type="Submit" class="btn btn-light white1 center leftside" style="width:70px; border-color: #646464;">  <h4 style="font-size:15px; margin:4px; color:rgb(100, 55, 184);"> Send </h4> </button> 
   
       <div id="emailHelp" class="form-text leftside">By clicking button “Send” you agree to the Terms and Conditions</div>
 
     </form>
</div>

       </section>
    </div>
    `
}

const SignUp = {
    template: `
    <div class="jumbotron p-5">
    <br> <br>


    <!-- Row 1 starts -->
    <div class="row">

      <div class="col-4"> </div>
   
        <h1>
            <center>
                Create your Account
            </center>
        </h1>

      <div class="col-4"> </div>

    </div>
    <!-- Row 1 ends -->
    <br> <br>
    <!-- Row 2 starts -->
    <div class="row">
        <div class="col-3"> </div> <!-- row2 col 1-->
        <div class="col-6">
            <!-- row2 col 2-->
                <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">
                        Name
                    </label>
                    <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" v-model="name">
                    <!-- <div id="emailHelp" class="form-text">Never share your username with anyone else.</div> -->
                </div>
        </div>
      <!-- row 2 col 2 ends-->
      <div class="col-3"> </div>
      <!--row2 col3-->
    </div>
    <!-- Row 3 ends -->
    <!-- Row 3 starts -->
    <div class="row">
      <div class="col-3"> </div> <!-- row2 col 1-->
      <div class="col-6">
        <div class="mb-3">
          <label for="exampleInputPassword1" class="form-label">Email Address</label>
          <input type="email" class="form-control" id="exampleInputPassword1" v-model="email">
        </div>
        <div class="mb-3">
          <label for="exampleInputPassword1" class="form-label">Password</label>
          <input type="password" class="form-control" id="exampleInputPassword1" v-model="password">
        </div>


        <div class = "row">

          <div class = "col">
        <div class="mb-3">
          <label for="exampleInputPassword1" class="form-label">Date of Birth</label>
          <input type="date" class="form-control" id="exampleInputPassword1" v-model="dob">
        </div>
      </div>

      <div class = "col">
        <div class="mb-3">
          <label for="exampleInputPassword1" class="form-label">Gender</label>
          <select class="form-select topmargin" aria-label="Default select example" id="inputaddress" v-model="gender">
            <option selected value="0">Male</option>
            <option value="1">Female</option>
            <option value="2">Other</option>
          </select>
        </div>
      </div>
      <div class = "col">
        <label for="exampleInputPassword1" class="form-label">Location</label>
        <select class="form-select topmargin" aria-label="Default select example" id="inputaddress" v-model="location">
          <option selected value="0">Hyderabad</option>
          <option value="1">Bengaluru</option>
          <option value="2">Malkajgiri</option>
          <option value="3">Srikakulam</option>
          <option value="4">Sangareddy </option>
          <option value="5">Solan</option>
          <option value="6">Malkajgiri</option>
          <option value="7">Visakhapatnam</option>
          <option value="8">Nalgonda</option>
        </select>
      </div>
      </div>      
      <!-- row 3 col 2 ends-->
      <div class="col-3"> </div>
      <!--row3 col3-->
    </div>
    <!-- row 3 ends-->

    <!-- row 4 starts-->
    <div class="row">
      <div class="col-3"> </div> <!-- row2 col 1-->
      <div class="col-6 fluid">
        <button type="button" class="btn btn-light purple1 center" @click="signup"> <p style="color:#ffffff;margin-bottom:0px;"> Submit </p> </button>
      </div>
      <!-- row4 col2 ends-->

      <div class="col-3"> </div> <!-- row 4 col3-->
    </div>
    <!-- row 4 ends-->


  </div>
  <!--jumbotron ends-->
    </div>
    `,

    data: function() {
        return {
        name: '',
        email: '',
        password: '',
        dob: '',
        gender: '',
        location: ''
        }
    },
  
    methods: {

        signup: async function() {
            const data = {
                name: this.name,
                email: this.email,
                password: this.password,
                dob: this.dob,
                gender: this.gender,
                location: this.location
            }
            
            if(String(this.email).toLowerCase().match("@drreddys.com$")) {
                if (String(this.password).length >= 8) {
                  await fetch('http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/signup', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(data),
                    })
                      .then(response => response.json())
                      .then(responseJson => {
                        Swal.fire({
                          icon: 'success',
                          title: 'Successfully signed up!!!',
                          showConfirmButton: false,
                          timer: 2000
                        })
                    })
                    function myLoop(r) {
                      setTimeout(function() {
                        r                  
                      }, 2000)
                    }
                    myLoop(this.$router.push("/"));
                } else {
                    Swal.fire({
                      icon: 'error',
                      title: 'Wrong Password Format',
                      text: 'Password must be atleast 8 characters long.'
                    })
                }
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Not Allowed',
                text: 'Only email ids ending with "@drreddys.com" are allowed.'
              })
            }
        }
    }
}

const Login = {
  template: `
      <div>

        <br> <br> <br> <br> <br>



  <div class="jumbotron p-5">


    <!-- Row 1 starts -->
    <div class="row">

      <div class="col-4"> </div>
      <div class="col-6">
        <h1>Log In to Your Account</h1>
      </div>
      <div class="col-4"> </div>

    </div>
    <!-- Row 1 ends -->
    <br> <br> <br>
    <!-- Row 2 starts -->
    <div class="row">
      <div class="col-3"> </div> <!-- row2 col 1-->
      <div class="col-6">
        <!-- row2 col 2-->
          <div class="mb-3">
            <label for="exampleInputEmail1" class="form-label">Email</label>
            <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" v-model="email">
            <!-- <div id="emailHelp" class="form-text">Never share your username with anyone else.</div> -->
          </div>
      </div>
      <!-- row 2 col 2 ends-->
      <div class="col-3"> </div>
      <!--row2 col3-->
    </div>
    <!-- Row 3 ends -->
    <!-- Row 3 starts -->
    <div class="row">
      <div class="col-3"> </div> <!-- row2 col 1-->
      <div class="col-6">
        <div class="mb-3">
          <label for="exampleInputPassword1" class="form-label">Password</label>
          <input type="password" class="form-control" id="exampleInputPassword1" v-model="password">
        </div>
        <br>  
      </div>
      <!-- row 3 col 2 ends-->
      <div class="col-3"> </div>
      <!--row3 col3-->
    </div>
    <!-- row 3 ends-->
    

    <!-- row 4 starts-->
    <div class="row">
      <div class="col-3"> </div> <!-- row2 col 1-->
      <div class="col-6 fluid">
      <button type="submit" class="btn btn-secondary purple1 center givemargin" @click="login"> Submit </button>

         <div> 
         <br>
      Don't have an account? <router-link to="/signup" style="color: rgb(100, 55, 184);">Register</router-link>
      </div>
      
      </div>
      <!-- row4 col2 ends-->

      <div class="col-3"> </div> <!-- row 4 col3-->
      
    </div>
    <!-- row 4 ends-->


  </div>
  <!--jumbotron ends-->
      
  
      </div>`,

  data: function() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    login: function() {
        const data = {
            email: this.email,
            password: this.password
        }

        if(String(this.email).toLowerCase().match("@drreddys.com$")) {
            if (String(this.password).length >= 8) {
                fetch('http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/login?include_auth_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                })
                .then(response => response.json())
                .then(responseJson => {         
                    localStorage.setItem("authentication_token",responseJson.response.user.authentication_token)
                    this.$router.go('/predict')
                })
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Wrong Password Format',
                  text: 'Password must be atleast 8 characters long.'
                })
            }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Not Allowed',
            text: 'Only email ids ending with "@drreddys.com" are allowed.'
          })
        }
      }
  }
}

const Predict = {
    template: `
    <div>
        <br> <br>
        <div class="container py-5 display-4">
            <span class="badge text-bg-light block margin-auto"> <h4 class="m-0 p-0" style="font-size:15px; margin:3.5px; color:rgb(51, 51, 51);">Dr. Reddy's ScanPlus+</h4></span> 
        </div>
        
        <div class="container"> 
            <div class="col">
                <h1 style="margin-left: 30px; font-size:60px; text-align:center;">
                    ScanPlus+
                </h1>
            </div>

            <p style="color:rgb(95, 95, 95); margin-left: 30px; font-size:20px; margin-top: 10px; text-align:center;">
                Upload a clear picture of your prescription.
            </p>

            <br> <br> <br>

            <form>
                <div class="mb-3">
                    <label for="formFile" class="form-label">
                        Upload prescription image (.jpeg/.jpg/.gif format only)
                    </label>
                    <input class="form-control" type="file" id="formFile" accept="image/png, image/jpg, image/jpeg" />
                </div>

                <button type="button" @click="onUpload" class="btn btn-light purple1 center block margin-auto" style="display: flex; justify-content: center; color:rgb(74, 105, 133);">
                    <h4 style="font-size:15px; margin:3.5px; color:rgb(255, 255, 255); text-align:center;">
                        Upload
                    </h4>
                </button>
            
            </form> 

            <br> <br> <br> <br> <br> <br> <br>  
            
        </div>
    </div>
    `,

    data: function() {
      return {
        token: localStorage.getItem("authentication_token"),
        clicked: false
      }
    },

    methods: {
        async onUpload() {
          this.clicked = true
          var input = document.querySelector('input[type="file"]')
  
          var data_ = new FormData()
          data_.append('image', input.files[0])
          
          if(input.files[0] !== undefined) {
            await fetch('http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/upload', {
              method: 'POST',
              body: data_
            })
            if(this.token) {
                result = await Swal.fire({
                  title: 'What do you want to do?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: 'rgb(100, 55, 184)',
                  cancelButtonColor: '#aaa',
                  confirmButtonText: 'Annotate',
                  cancelButtonText: 'See Results'
                })
                if (result.isConfirmed) {
                    this.$router.push('/annotator')
                  } else {
                    this.$router.push('/predict_result')
                  }
            } else {
              this.$router.push('/predict_result')
            }
          } else {
            Swal.fire(
              'Did you forget something?',
              'Please add a prescription first.',
              'question'
            )
          }
        }
    }
}

const AnnotationEngine = {
    template: `
    <div>
      <div class="row">
        <h1>
          <center> Annotate the Prescription </center>
        </h1>
      </div>
      <div class="jumbotron p-5" v-if="txt">
        <!-- Row 1 starts -->
        <!-- Row 1 ends -->
        <!-- Row 2 starts -->
        <div class="row">
          <div class="col-3"> </div> <!-- row2 col 1-->
          <div class="col-6">
            <!-- row2 col 2-->
          </div>
          <div class="col-3"> </div>
          <!--row2 col3-->
        </div>
        <!-- Row 2 ends -->
        <!-- Row 3 starts -->
        <div class="row">
          <div class="col-3"><img :src="file" alt="Prescription" width="500" height="600"> </div>
          <!-- row2 col 1-->

          <div class="col"> </div>
          <div class="col-7">
            <div class="row">
              <div class="row">
                <div class="form-group purple-border">
                  <p style="text-align:center;" class="style_it" @click="annotate" v-html="txt">
                  </p>
                </div>
              </div>
              <br><br><br><br><br><br><br>
              <div class="row overflow-auto fix-height">
                <div class="col">
                  <br><br>
                  <div class="=mb-3">
                    <label for="exampleInputPassword1" class="form-label">NER Prediction</label>
                    <div v-if="NERData.length">
                      <div v-for="(d,index) in NERData">
                        <input type="text" class="form-control" id="exampleInputPassword1" v-model="NERData[index]" disabled>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col">
                  <br><br>
                  <div class="mb-3">
                    <label for="exampleInputPassword1" class="form-label">Correct Spelling</label>
                    <div v-if="NERData.length">
                      <div v-for="(d,index) in NERData">
                        <input type="text" class="form-control" id="exampleInputPassword1" v-model="CorrectedData[index]">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col">
                  <br><br>
                  <div class="mb-3">
                    <label for="inputclass" class="form-label">Class</label>
                    <div v-if="NERData.length">
                      <div v-for="(d,index) in NERData">
                        <select class="form-select" aria-label="Default select example" id="inputclass" v-model="Category[index]">
                          <option selected value="0">Medicine</option>
                          <option value="1">Medical Condition</option>
                          <option value="2">Diagnostic Test</option>
                          <option value="3">Frequency</option>
                          <option value="4">Name</option>
                          <option value="5">Date</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col">
                  <br><br>
                  <div class="col-6 fluid">
                    <label for="inputclass" class="form-label">Action</label>
                    <div v-for="(d,index) in NERData">
                      <button type="button" class="btn btn-light red1" @click="dlt(index)">
                        <p style="color:#ffffff;margin-bottom:0px;"> Delete </p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">

              <div class="col fluid">
                <br>
                <button type="button" class="btn btn-light purple1 save" @click="UpdateDatasets" style="margin-left:-10px; width:95%">
                  <p style="color:#ffffff;margin-bottom:0px;">
                    Save
                  </p>
                </button>
              </div>

            </div>

            <!-- row4 col2 ends-->

            <div class="col-3"> </div> <!-- row 4 col3-->
          </div>
        <!-- row 4 ends-->
        </div>
      </div>
      <div v-else>
        <div class="content">
          <div class="load-3">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
        </div>
      </div>
    </div>
    <!--jumbotron ends-->
  </div>
    `,
    
    data: function() {
        return {
          NERData: [],
          CorrectedData: [],
          Category: [],
          txt: "",
          file: "",
          dict: "",
          token: localStorage.getItem("authentication_token")
        }
    },

    beforeMount() {
      function process(text, s) {
        new1 = ""
            var basearray = Object.keys(s)
            var max_idx = 0
            basearray.forEach(function(j) {
                for (i=0;i<s[j].length;i++) {
                    if (i==0) {
                        new1 += '<span style="background-color: white;\
                                              font-size: 14px;\
                                              line-height: 24px;\
                                              font-weight: 400;">'+
                                      text.slice(0,s[j][i][1][0])
                                  +'</span>'
                    } else {
                        new1 += '<span style="background-color: white;\
                                              font-size: 14px;\
                                              line-height: 24px;\
                                              font-weight: 400;">'+
                                      text.slice(s[j][i-1][1][1]+1,s[j][i][1][0])
                                  +'</span>'
                    }
                    var temp = text.slice(s[j][i][1][0], s[j][i][1][1]+1)
                    new1 += text.replace(temp, 
                            '<span style="background-color: #2A3C54;\
                                          display: inline-grid;\
                                          text-align: center;\
                                          border-radius: 4px;\
                                          margin: 0 2px 5px 2px;\
                                          padding: 1px;">'+
                                '<span style="font-size: 14px;\
                                              line-height: 24px;\
                                              background: #f1f2f3;\
                                              border-width: medium;\
                                              text-align: center;\
                                              font-weight: 400;\
                                              border-radius: 5px;\
                                              padding: 2px 5px;\
                                              display: block;\
                                              margin: 3px 2px;">'+
                                    temp
                                +'</span>'+
                                '<span style="font-size: 14px;\
                                              line-height: 24px;\
                                              color: #ffffff;\
                                              text-transform: uppercase;\
                                              font-weight: 500;\
                                              display: block;\
                                              padding: 3px 5px;">'+
                                    j+
                                '</span>'+
                            '</span>'
                            )

                    if (max_idx < s[j][i][1][1]) {
                      max_idx = s[j][i][1][1]
                    }
                }
            })            
        return new1 + text.slice(max_idx+1)
    }
        fetch('http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/annotate', {
            method: "GET",
            headers: {
              "Authentication-Token": localStorage.getItem("authentication_token")
            }
        }).then(res => res.json())
          .then(resp => {
            this.txt = process(resp.msg, resp.dic),
            this.file = resp.file
          }) 
    },

    methods: {
        annotate: function() {
            txt = window.getSelection().toString().trim();
            if (txt) {
                if (!this.NERData.includes(txt)) {
                    this.NERData.push(txt);
                    this.CorrectedData.push(txt);
                    selectedclass = document.getElementById("inputaddress");
                    if(true) {
                      this.Category.push("0");
                    }
                }
            }   
        },

        async UpdateDatasets() {
          const data = {
            NERData: this.NERData,
            CorrectedData: this.CorrectedData,
            Category: this.Category
          }

          await fetch('http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/annotate', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(data),
          })
            result = await Swal.fire({
              title: 'What do you want to do?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: 'rgb(100, 55, 184)',
              cancelButtonColor: '#aaa',
              confirmButtonText: 'See Results',
              cancelButtonText: 'Retrain'
            })
            if (result.isConfirmed) {
                this.$router.push('/predict_result')
              } else {
                fetch('http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/train', {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      "Authentication-Token": localStorage.getItem("authentication_token")
                  }
                })
              }
        },

        dlt: function(index) {
          this.NERData.splice(index,1);
          this.CorrectedData.splice(index,1);
          this.Category.splice(index,1);
        }
    }
}

const PredictResult = {
    template: `
    <div>
      <div class="row">
        <h1>
          <center> Results </center>
        </h1>
      </div>
      <div class="jumbotron p-5" v-if="txt">
        <!-- Row 1 starts -->
        <!-- Row 1 ends -->
        <!-- Row 2 starts -->
        <div class="row">
          <div class="col-3"> </div> <!-- row2 col 1-->
          <div class="col-6">
            <!-- row2 col 2-->
          </div>
          <div class="col-3"> </div>
          <!--row2 col3-->
        </div>
        <!-- Row 2 ends -->
        <!-- Row 3 starts -->
        <div class="row">
          <div class="col-3"><img :src="file" alt="Prescription" width="500" height="600"> </div>
          <!-- row2 col 1-->

          <div class="col"> </div>
          <div class="col-7">
            <div class="row">
              <div class="row">
                <div class="form-group purple-border">
                  <p style="text-align:center;" v-html="txt">
                  </p>
                </div>
              </div>
              <br><br><br><br><br><br><br>
            </div>

            <!-- row4 col2 ends-->

            <div class="col-3"> </div> <!-- row 4 col3-->
          </div>
        <!-- row 4 ends-->
        </div>
      </div>
      <div v-else>
        <div class="content">
          <div class="load-3">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
        </div>
      </div>
    </div>
    <!--jumbotron ends-->
    </div>
    `,
    
    data: function() {
        return {
          txt: "",
          file: "",
          dict: "",
          token: localStorage.getItem("authentication_token")
        }
    },

    beforeMount() {
      function process(text, s) {
        new1 = ""
            var basearray = Object.keys(s)
            var max_idx = 0
            basearray.forEach(function(j) {
                for (i=0;i<s[j].length;i++) {
                    if (i==0) {
                        new1 += '<span style="background-color: white;\
                                              font-size: 14px;\
                                              line-height: 24px;\
                                              font-weight: 400;">'+
                                      text.slice(0,s[j][i][1][0])
                                  +'</span>'
                    } else {
                        new1 += '<span style="background-color: white;\
                                              font-size: 14px;\
                                              line-height: 24px;\
                                              font-weight: 400;">'+
                                      text.slice(s[j][i-1][1][1]+1,s[j][i][1][0])
                                  +'</span>'
                    }
                    var temp = text.slice(s[j][i][1][0], s[j][i][1][1]+1)
                    new1 += text.replace(temp, 
                            '<span style="background-color: #2A3C54;\
                                          display: inline-grid;\
                                          text-align: center;\
                                          border-radius: 4px;\
                                          margin: 0 2px 5px 2px;\
                                          padding: 1px;">'+
                                '<span style="font-size: 14px;\
                                              line-height: 24px;\
                                              background: #f1f2f3;\
                                              border-width: medium;\
                                              text-align: center;\
                                              font-weight: 400;\
                                              border-radius: 5px;\
                                              padding: 2px 5px;\
                                              display: block;\
                                              margin: 3px 2px;">'+
                                    temp
                                +'</span>'+
                                '<span style="font-size: 14px;\
                                              line-height: 24px;\
                                              color: #ffffff;\
                                              text-transform: uppercase;\
                                              font-weight: 500;\
                                              display: block;\
                                              padding: 3px 5px;">'+
                                    j+
                                '</span>'+
                            '</span>'
                            )

                    if (max_idx < s[j][i][1][1]) {
                      max_idx = s[j][i][1][1]
                    }
                }
            })            
        return new1 + text.slice(max_idx+1)
    }
        fetch('http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/annotate', {
            method: "GET",
            headers: {
              "Authentication-Token": localStorage.getItem("authentication_token")
            }
        }).then(res => res.json())
          .then(resp => {
            this.txt = process(resp.msg, resp.dic),
            this.file = resp.file
          }) 
    }
}

const SavedFiles = {
  template: `
  <div>
  <div>
  <br><br><br>
<!--row 3 starts-->
<!--row 4 starts-->
<h1 class="two"> Prescriptions </h1> <br> <br> <br> <br>
<!--22dd-->
<div>
<!---->
              <br> 
<!--med starts-->
     <div class="div12" v-for="(prescription, index) in Prescriptions">
       <div class="squaremed1"> 
            <img src="frontend/static/prescription2.png" height="100px" width="185" style="margin-left:-54px; margin-top:-11px;"> 
        </div> 
        <p style="margin-left: 150px; margin-top:-85px; color:#727272; font-size:15px;"> <b> {{prescription}} </b> <br> {{Date[index]}} <br> </p>
        <button type="button" class="btn btn-light purple1 four1" @click="annotate(prescription)">  <p style="color: rgb(255, 255, 255); margin-bottom: 0px; font-size:90%;"> Annotate </p></button>
        <button type="button" class="btn btn-light purple1 five1" @click="dlt(prescription)">  <p style="color: rgb(255, 255, 255); margin-bottom: 0px; font-size:90%;"> Delete </p></button>
   </div>
<!--med ends-->
<!--extracted text starts-->  
     </div>
</div>
<div class="div6">
</div>
  </div>
  `,

  data: function() {
    return {
      Prescriptions: [],
      Date: []
    }
  },

  beforeMount() {
      fetch('http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/savedfiles', {
          method: "GET"
      }).then(res => res.json())
        .then(resp =>  {
        this.Prescriptions = resp.prescriptions,
        this.Date = resp.date
      })
  },

  methods: {
    annotate: function(prescription) {

      fetch(`http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/annotatefile/${prescription}`, {
        method: "GET"
      }).then(res => res.json())
        .then(resp => connsole.log(resp))
        this.$router.push('/annotator')   
    },

    dlt: function(prescription) {
      const swalWithBootstrapButtons = Swal.mixin({
        buttonsStyling: true
      })
      
      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'No, cancel!',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          ).then((result) => {
            fetch(`http://ec2-13-127-242-3.ap-south-1.compute.amazonaws.com:5000/api/deletefile/${prescription}`, {
            method: "GET"
            })
          }).then(res => res.json())
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            prescription+' is safe :)',
            'error'
          )
        }
      })     
    }
  }
}

const routes = [{
    path: '/',
    component: Base,
    children: [
        { path: '', component: Homepage, name: 'homepage' },
        { path: 'about', component: About, name: 'about' },
        { path: 'contact', component: Contact, name: 'contact' },
        { path: 'signup', component: SignUp, name: 'signup' },
        { path: 'login', component: Login, name: 'login' },
        { path: 'predict', component: Predict, name: 'predict' },
        { path: 'annotator', component: AnnotationEngine, name: 'annotationengine' },
        { path: 'predict_result', component: PredictResult, name: 'predictresult' },
        { path: 'savedfiles', component: SavedFiles, name: 'savedfiles' },
    ]
}];

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (localStorage.getItem('authentication_token')) {
    if (to.name === 'login' || to.name === 'signup' || to.name === 'homepage' || to.name === 'about' || to.name === 'contact') {
      next({ name: 'predict' })
    } 
    else next()
  } else {
    if (to.name === 'savedfiles' || to.name === 'annotationengine') {
      next({ name: 'login' })
    } 
    else next()
  }
  
})

let app = new Vue({
    el: "#app",
    router: router
})