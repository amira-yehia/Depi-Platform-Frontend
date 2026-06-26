import "./ProfileSidebar.css";
import ProfileScoreCard from "./ProfileScoreCard";
import ProfileStatsGrid from "./ProfileStatsGrid";
import ProfileHourlyRateCard from "./ProfileHourlyRateCard";
import SendMessageButton from "./SendMessageButton";

export default function ProfileSidebar({ profile }) {
  return (
    <div className="psb">
      <ProfileScoreCard card={profile.scoreCard} />
      <ProfileStatsGrid stats={profile.stats} />
      <ProfileHourlyRateCard card={profile.hourlyRate} />
      <SendMessageButton label={profile.sendMessageLabel} />
    </div>
  );
}