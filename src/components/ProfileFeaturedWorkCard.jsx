import "./ProfileFeaturedWorkCard.css";
import ProfileWorkCard from "./ProfileWorkCard";

export default function ProfileFeaturedWorkCard({ work }) {
  return (
    <section className="pworkShell">
      <div className="pworkShell__head">
        <div>
          <h2 className="pworkShell__title">{work.title}</h2>
          <div className="pworkShell__sub">{work.subtitle}</div>
        </div>

        <div className="pworkShell__right">
          {/* Add Portfolio button (own profile only) */}
          {work.onAdd && (
            <button
              type="button"
              className="pworkShell__addBtn"
              onClick={work.onAdd}
              title="Add portfolio item"
            >
              <i className="fa-solid fa-plus" /> Add
            </button>
          )}
          {work.rightLinkText}
        </div>
      </div>

      <div className="pworkShell__grid">
        {work.items.length === 0 && (
          <p
            style={{ color: "#94a3b8", gridColumn: "1/-1", padding: "16px 0" }}
          >
            No portfolio items yet.{" "}
            {work.onAdd && (
              <button
                type="button"
                onClick={work.onAdd}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff8a34",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Add your first project
              </button>
            )}
          </p>
        )}
        {work.items.map((it) => (
          <div key={it.id || it.title} className="pworkShell__itemWrap">
            <ProfileWorkCard item={it} />
            {/* Edit / Delete only if handlers exist (own profile) */}
            {(it.onEdit ||
              it.onDelete ||
              it.onPublish ||
              it.onUnpublish ||
              it.onFeature) && (
              <div className="pworkShell__itemActions">
                {it.onEdit && (
                  <button
                    type="button"
                    className="pworkShell__editBtn"
                    onClick={it.onEdit}
                    title="Edit"
                  >
                    <i className="fa-solid fa-pen" />
                  </button>
                )}
                {it.onDelete && (
                  <button
                    type="button"
                    className="pworkShell__deleteBtn"
                    onClick={it.onDelete}
                    title="Delete"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                )}
                {it.onPublish && !it.isPublished && (
                  <button
                    type="button"
                    className="pworkShell__publishBtn"
                    onClick={it.onPublish}
                  >
                    Publish
                  </button>
                )}

                {it.onUnpublish && it.isPublished && (
                  <button
                    type="button"
                    className="pworkShell__unpublishBtn"
                    onClick={it.onUnpublish}
                  >
                    Unpublish
                  </button>
                )}

                {it.onFeature && (
                  <button
                    type="button"
                    className="pworkShell__featureBtn"
                    onClick={it.onFeature}
                  >
                    {it.isFeatured ? "★ Featured" : "☆ Feature"}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
