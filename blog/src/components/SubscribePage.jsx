import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./SubscribePage.css";

export default function SubscribePage() {
  var emailState = useState("");
  var email = emailState[0];
  var setEmail = emailState[1];
  
  var nameState = useState("");
  var name = nameState[0];
  var setName = nameState[1];

  var phoneState = useState("");
  var phone = phoneState[0];
  var setPhone = phoneState[1];

  var statusState = useState("idle"); // idle, loading, success, error
  var status = statusState[0];
  var setStatus = statusState[1];
  
  var errorMsgState = useState("");
  var errorMsg = errorMsgState[0];
  var setErrorMsg = errorMsgState[1];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    setErrorMsg("");

    try {
      // Insert into the 'subscribers' table including phone
      var { error } = await supabase
        .from("subscribers")
        .insert([{ 
          email: email, 
          full_name: name, 
          phone: phone 
        }]);

      if (error) {
        // Check if it's a duplicate email error
        if (error.code === '23505') {
          setStatus("error");
          setErrorMsg("This email is already subscribed!");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
      console.error("Subscription error:", err);
    }
  }

  return (
    <div className="subscribe-page">
      <div className="container">
        <div className="subscribe-card">
          
          {/* Icon */}
          <div className="subscribe-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="M22 7L12 13L2 7"></path>
            </svg>
          </div>

          {status === "success" ? (
            <div className="subscribe-success">
              <h2>You're subscribed!</h2>
              <p>Thank you for joining our community. We'll keep you updated with the latest insights.</p>
            </div>
          ) : (
            <>
              <h2 className="subscribe-title">Subscribe to our newsletter</h2>
              <p className="subscribe-desc">Get the latest research, insights, and stories from the frontlines of public health delivered straight to your inbox.</p>
              
              <form className="subscribe-form" onSubmit={handleSubmit}>
                
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name (Optional)</label>
                  <input 
                    id="name" 
                    type="text" 
                    className="form-input" 
                    placeholder="Jane Doe" 
                    value={name} 
                    onChange={function(e) { setName(e.target.value); }} 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input 
                    id="email" 
                    type="email" 
                    className="form-input" 
                    placeholder="jane@company.com" 
                    required 
                    value={email} 
                    onChange={function(e) { setEmail(e.target.value); }} 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number (Optional)</label>
                  <input 
                    id="phone" 
                    type="tel" 
                    className="form-input" 
                    placeholder="+256 700 000000" 
                    value={phone} 
                    onChange={function(e) { setPhone(e.target.value); }} 
                  />
                </div>

                {status === "error" && <p className="form-error">{errorMsg}</p>}

                <button type="submit" className="form-submit-btn" disabled={status === "loading"}>
                  {status === "loading" ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}