import "./ProfileHeader.css";

export default function ProfileHeader({ profile }) {
  return (
    <header className="phWrap">
      <div className="phInner">
        <img className="phAvatar" src={profile.avatarUrl} alt={profile.name} />

        <div className="phCenter">
          <div className="phNameRow">
            <h1 className="phName">{profile.name}</h1>
            {profile.verified && (
              <span className="phVerified">
                <i className="fas fa-check" aria-hidden="true" /> Verified
              </span>
            )}
          </div>

          <div className="phRole">{profile.roleTitle}</div>
          <div className="phProfileCompletion">
            <div className="d-flex justify-content-between mb-2">
              <span>Profile Completion</span>
              <span>{profile.profileScore || 92}%</span>
            </div>

            <div className="progress">
              <div
                className="progress-bar bg-warning"
                style={{
                  width: `${profile.profileScore || 92}%`,
                }}
              />
            </div>
          </div>
          <div className="phMetaRow">
            {profile.metaRow.map((m, i) => (
              <span className="phMetaItem" key={i}>
                <i className={m.icon} aria-hidden="true" />
                {m.text}
              </span>
            ))}
          </div>
        </div>

        <div className="phRight">
          <button className="phHireBtn" type="button">
            <i className="fas fa-briefcase" aria-hidden="true" />{" "}
            {profile.actions.hireText}
          </button>

          <div className="phIconBtns">
            <button className="phIconBtn" type="button" aria-label="Like">
              <i className="far fa-heart" aria-hidden="true" />
            </button>
            <button className="phIconBtn" type="button" aria-label="Share">
              <i className="fas fa-share-alt" aria-hidden="true" />
            </button>
          </div>

          <div className="phAvailable">
            <span className="phDot" />
            {profile.availableText}
          </div>
        </div>
      </div>
    </header>
  );
}
