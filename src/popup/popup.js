/*global chrome*/
import React from "react";
import "./popup.css";
import cover from "../../icons/cover.png";

function App() {
  const [buckets, setBuckets] = React.useState([]);
  const [profiles, setProfiles] = React.useState([]);
  const [isConfirmModal, setIsConfirmModal] = React.useState(0);
  const [isDropDownActive, setIsDropDownActive] = React.useState(false);
  const [selectedBucket, setSelectedBucket] = React.useState("All Buckets");

  const removeHandler = (id) => {
    const profileCopy = { ...profiles };
    delete profileCopy[id];
    setProfiles(profileCopy);
    chrome.storage.local
      .set({ linkedInProfileFav: { ...profileCopy } })
      .then(() => {});
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

    chrome.storage.local.get(["linkedInProfileFav"]).then((response) => {
      const list = response.linkedInProfileFav || {};
      if (list) {
        setProfiles(list);
      }
    });
  }, []);

  React.useEffect(() => {
    chrome.storage.local.get(["linkedInProfileFav"]).then((response) => {
      const list = response.linkedInProfileFav || {};
      if (!list) {
        return;
      }
      if (selectedBucket === "All Buckets") {
        setProfiles(list);
      } else {
        const filteredList = {};
        Object.keys(list).forEach((key) => {
          if (list[key].buckets?.indexOf(selectedBucket) > -1) {
            filteredList[key] = list[key];
          }
        });
        setProfiles(filteredList);
      }
    });
  }, [selectedBucket]);

  return (
    <>
      <div className="container is-fluid is-size-7 linkedin-fav-extension">
        <div className="columns">
          <div className="column">
            <figure className="image ">
              <img src={cover} />
            </figure>
          </div>
        </div>
        <div className={`dropdown ${isDropDownActive ? "is-active" : ""}`}>
          <div className="dropdown-trigger">
            <button
              className="button"
              aria-haspopup="true"
              aria-controls="dropdown-menu"
              onClick={() => {
                setIsDropDownActive(!isDropDownActive);
              }}
            >
              <span>{selectedBucket}</span>
              <span className="icon is-small">
                <i className="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <div className="dropdown-menu" id="dropdown-menu" role="menu">
            <div className="dropdown-content">
              {["All Buckets", ...buckets].map((item, index) => {
                return (
                  <a
                    key={index}
                    href="#"
                    className={`dropdown-item ${
                      selectedBucket === item ? "is-active" : ""
                    }`}
                    onClick={() => {
                      setSelectedBucket(item);
                      setIsDropDownActive(false);
                    }}
                  >
                    {item}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        {
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
                <th>Phone</th>
                <th>Comment</th>
                <th>Remove</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(profiles).map((key, index) => {
                const item = profiles[key];
                return (
                  <tr key={index}>
                    <td>
                      <a href={item.profile} target="_blank">
                        <div className="columns is-1">
                          <div className="column">
                            <figure className="image is-48x48 ">
                              <img
                                className="is-rounded"
                                src={item.profileImage}
                              />
                            </figure>
                          </div>
                          <div className="column">{item.name}</div>
                        </div>
                      </a>
                    </td>
                    <td>{item.title}</td>
                    <td>{item.phone || "-"}</td>
                    <td>{item.comment || "-"}</td>
                    <td>
                      <button
                        onClick={() => {
                          setIsConfirmModal(item.id);
                        }}
                        className="delete is-medium"
                      ></button>
                    </td>
                  </tr>
                );
              })}
              {Object.keys(profiles).length === 0 && (
                <tr>
                  <td>Bucket is Empty</td>
                </tr>
              )}
            </tbody>
          </table>
        }
      </div>
      {isConfirmModal !== 0 && (
        <div>
          <div
            className={`modal is-size-7 ${isConfirmModal ? "is-active" : ""}`}
          >
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Are you sure to delete</p>
                <button
                  onClick={() => setIsConfirmModal(0)}
                  className="delete"
                  aria-label="close"
                ></button>
              </header>
              <footer className="modal-card-foot">
                <button
                  onClick={() => {
                    removeHandler(isConfirmModal);
                  }}
                  className="button is-success"
                >
                  Confirm
                </button>
                <button onClick={() => setIsConfirmModal(0)} className="button">
                  Cancel
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
