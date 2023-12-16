/*global chrome*/
import React from "react";
import "./content.css";
let profileRef;

function Modal() {
  const [buckets, setBuckets] = React.useState([]);
  const [selectedBuckets, setSelectedBuckets] = React.useState([]);
  const [bucketName, setBucketName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [profileMeta, setProfileMeta] = React.useState({});
  const [isNewBucket, setIsNewBucket] = React.useState(false);
  const bucketAddHandler = () => {
    setIsNewBucket(true);
  };
  const bucketSaveHandler = () => {
    if (buckets.indexOf(bucketName) > -1) {
      alert("Bucket Name Already Exist");
      return;
    }
    setBucketName("");
    chrome.storage.local
      .set({ linkedInProfileBuckets: [...buckets, bucketName] })
      .then(() => {});
    setBuckets([...buckets, bucketName]);
  };
  const bucketSelectionHandler = (bucket) => {
    const list = [...selectedBuckets];
    const index = list.indexOf(bucket);
    if (index > -1) {
      list.splice(index, 1);
      setSelectedBuckets(list);
    } else {
      setSelectedBuckets([...list, bucket]);
    }
  };

  const onSaveHandler = () => {
    const payload = {
      id: profileMeta?.id,
      profileImage: profileMeta?.pic,
      buckets: [...selectedBuckets],
      comment,
      name: profileMeta?.name,
      title: profileMeta?.title,
      profile: location.href,
      phone,
      email,
      timestamp: new Date().getTime(),
    };

    chrome.storage.local.get(["linkedInProfileFav"]).then((result) => {
      const list = result.linkedInProfileFav || {};
      chrome.storage.local
        .set({ linkedInProfileFav: { ...list, [profileMeta?.id]: payload } })
        .then(() => {});
      document
        .getElementById("linkedin-fav-extension")
        .classList.remove("is-active");
      document.getElementById("linkedin-extension-button").textContent =
        "Added to Bucket !";
      document
        .getElementById("linkedin-extension-button")
        .classList.remove("is-link");
      document
        .getElementById("linkedin-extension-button")
        .classList.add("is-primary");
    });
  };

  const resetProfileData = () => {
    chrome.storage.local.get(["linkedInProfileFav"]).then((response) => {
      const list = response.linkedInProfileFav || {};
      const regex = new RegExp(
        "(https?://(www.|de.)?linkedin.com/(mwlite/|m/)?in/([a-zA-Z0-9À-ž_.-]+)/?)"
      );
      const result = regex.exec(location.href) || [];

      const item = list[result[4]] || {};
      const { buckets = [], comment = "", phone = "", email = "" } = item;
      setSelectedBuckets(buckets);
      setComment(comment);
      setPhone(phone);
      setEmail(email);
    });
  };

  //SET Buckets and current Profile data
  React.useEffect(() => {
    chrome.storage.local.get(["linkedInProfileBuckets"]).then((result) => {
      let buckets = [];
      if (result.linkedInProfileBuckets) {
        buckets = [...result.linkedInProfileBuckets];
      }
      setBuckets(buckets);
    });

    resetProfileData();
  }, []);

  const tabChangeHandler = function (request, sender, sendResponse) {
    if (request.message === "TabUpdated") {
      const regex = new RegExp(
        "(https?://(www.|de.)?linkedin.com/(mwlite/|m/)?in/([a-zA-Z0-9À-ž_.-]+)/?)"
      );
      const result = regex.exec(location.href);
      if (!result) {
        return;
      }
      resetProfileData();
      const profileRef = document.querySelector(
        ".pv-top-card-profile-picture__container img"
      );
      const title = document.querySelector(
        ".wrksnmhvklIDWaLBcdIePlLksyeass .text-body-medium"
      )?.textContent;

      chrome.storage.local.get(["linkedInProfileFav"]).then((response) => {
        const list = response.linkedInProfileFav || {};
        let button = document.getElementById("linkedin-extension-button");
        if (!button) {
          button = document.createElement("button");
          const text = document.createTextNode("");
          button.appendChild(text);
          button.className = "button is-primary is-medium";
          button.id = "linkedin-extension-button";
          button.onclick = () => {
            document
              .getElementById("linkedin-fav-extension")
              .classList.add("is-active");
          };
          document
            .querySelector(".wrksnmhvklIDWaLBcdIePlLksyeass")
            .appendChild(button);
        }
        const item = list[result[4]] || {};
        const { buckets = [], comment = "" } = item;
        setSelectedBuckets(buckets);
        setComment(comment);
        const extensionButton = document.getElementById(
          "linkedin-extension-button"
        );
        if (item?.id) {
          extensionButton.classList.remove("is-link");
          extensionButton.classList.add("is-primary");
          extensionButton.textContent = "Added to Bucket !";
        } else {
          extensionButton.classList.remove("is-primary");
          extensionButton.classList.add("is-link");
          extensionButton.textContent = "Add to Bucket !";
        }
      });

      setProfileMeta({
        pic: profileRef?.src,
        name: profileRef?.title,
        title,
        id: result[4],
      });
    }
  };

  // UPDATE ON TAB CHANGE
  React.useEffect(() => {
    chrome.runtime.onMessage.addListener(tabChangeHandler);
    return () => {
      chrome.runtime.onMessage.removeListener(tabChangeHandler);
    };
  }, []);
  return (
    <div className="container">
      <div id="linkedin-fav-extension" className="modal">
        <div className="modal-background"></div>
        <div className="modal-content">
          <div className="container is-fluid">
            <div>
              <div className="field">
                <label className="label">Name</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    value={profileMeta?.name ?? ""}
                    disabled
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Phone</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    value={phone}
                    onChange={(evt) => setPhone(evt.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Email</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    value={email}
                    onChange={(evt) => setEmail(evt.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Buckets</label>
                <div className="control">
                  {!isNewBucket && (
                    <button
                      onClick={bucketAddHandler}
                      className="button is-link"
                    >
                      Add
                    </button>
                  )}
                  {isNewBucket && (
                    <div className="columns">
                      <div className="column">
                        <div className="field">
                          <div className="control">
                            <input
                              className="input"
                              type="text"
                              value={bucketName}
                              onChange={(evt) =>
                                setBucketName(evt.target.value)
                              }
                              placeholder="Bucket Name"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="column">
                        <div className="field is-grouped">
                          <div className="control">
                            <button
                              className="button is-link"
                              onClick={bucketSaveHandler}
                            >
                              Submit
                            </button>
                          </div>
                          <div className="control">
                            <button
                              className="button is-link is-light"
                              onClick={() => {
                                setIsNewBucket(false);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="field is-grouped is-grouped-multiline">
                {buckets?.length > 0 &&
                  buckets.map((bucket, index) => {
                    return (
                      <div className="control" key={index}>
                        <div key={index} className="tags">
                          <button
                            className={`tag is-large ${
                              selectedBuckets.indexOf(bucket) > -1
                                ? "is-success"
                                : "is-warning is-light"
                            }`}
                            onClick={() => {
                              bucketSelectionHandler(bucket);
                            }}
                          >
                            {bucket}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="field">
                <label className="label">Comments</label>
                <div className="control">
                  <textarea
                    className="textarea"
                    placeholder="Enter Comments"
                    value={comment}
                    onChange={(evt) => setComment(evt.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="field is-grouped">
                <div className="control">
                  <button onClick={onSaveHandler} className="button is-link">
                    Save
                  </button>
                </div>
                <div className="control">
                  <button
                    onClick={() => {
                      document
                        .getElementById("linkedin-fav-extension")
                        .classList.remove("is-active");
                      resetProfileData();
                    }}
                    className="button is-link is-light"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            document
              .getElementById("linkedin-fav-extension")
              .classList.remove("is-active");
            resetProfileData();
          }}
          className="modal-close is-large"
          aria-label="close"
        ></button>
      </div>
    </div>
  );
}

function Content() {
  return <Modal />;
}

export default Content;
