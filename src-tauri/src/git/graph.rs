use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GraphPath {
    pub path: String, // Bezier path or logical routing
    pub color: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GraphRow {
    pub commit_id: String,
    pub dot_color: String,
    pub dot_column: usize,
    pub paths: Vec<GraphPath>,
    pub has_refs: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LaneInfo {
    pub commit_id: String,
    pub color: String,
}

pub const COLORS: &[&str] = &[
    "#26a69a", "#ef5350", "#42a5f5", "#ab47bc", "#ffa726", "#66bb6a", "#ec407a", "#7e57c2",
];

// Generates an SVG path string for a curved branch line
pub fn draw_branch_curve(from_x: f64, from_y: f64, to_x: f64, to_y: f64, row_height: f64) -> String {
    if (from_x - to_x).abs() < f64::EPSILON {
        return format!("M {} {} L {} {}", from_x, from_y, to_x, to_y);
    }
    let diff_x = (to_x - from_x).abs();
    let mut radius = 6.0f64;
    if diff_x / 2.0 < radius { radius = diff_x / 2.0; }
    if row_height / 4.0 < radius { radius = row_height / 4.0; }
    
    let dir_x = if from_x < to_x { 1.0 } else { -1.0 };
    
    format!(
        "M {} {} L {} {} Q {} {}, {} {} L {} {} Q {} {}, {} {} L {} {}",
        from_x, from_y,
        from_x, from_y + row_height / 2.0 - radius,
        from_x, from_y + row_height / 2.0,
        from_x + radius * dir_x, from_y + row_height / 2.0,
        to_x - radius * dir_x, from_y + row_height / 2.0,
        to_x, from_y + row_height / 2.0,
        to_x, from_y + row_height / 2.0 + radius,
        to_x, to_y
    )
}

pub fn compute_graph_rows(
    commits: &[crate::git::history::CommitInfo],
    mut active_lanes: Vec<LaneInfo>,
    mut next_color_idx: usize,
    row_height: f64,
    column_width: f64,
) -> (Vec<GraphRow>, Vec<LaneInfo>, usize, usize) {
    let mut rows = Vec::new();
    let mut max_columns = active_lanes.len();

    for commit in commits {
        let mut paths = Vec::new();
        let previous_lanes = active_lanes.clone();

        let mut my_lanes = Vec::new();
        for (i, lane) in active_lanes.iter().enumerate() {
            if lane.commit_id == commit.id {
                my_lanes.push(i);
            }
        }

        let mut primary_lane;
        let mut my_color;

        if my_lanes.is_empty() {
            my_color = COLORS[next_color_idx % COLORS.len()].to_string();
            next_color_idx += 1;
            
            if let Some(empty_idx) = active_lanes.iter().position(|l| l.commit_id.is_empty()) {
                primary_lane = empty_idx;
                active_lanes[primary_lane] = LaneInfo { commit_id: commit.id.clone(), color: my_color.clone() };
            } else {
                primary_lane = active_lanes.len();
                active_lanes.push(LaneInfo { commit_id: commit.id.clone(), color: my_color.clone() });
            }
        } else {
            primary_lane = my_lanes[0];
            my_color = active_lanes[primary_lane].color.clone();
        }

        for &idx in my_lanes.iter().skip(1) {
            active_lanes[idx] = LaneInfo { commit_id: String::new(), color: String::new() };
        }

        let mut first_parent_old_lane = primary_lane;
        if !commit.parents.is_empty() {
            let p_id = &commit.parents[0];
            if let Some(existing_idx) = active_lanes.iter().enumerate().position(|(idx, l)| l.commit_id == *p_id && idx != primary_lane) {
                active_lanes[primary_lane] = LaneInfo { commit_id: String::new(), color: String::new() };
                first_parent_old_lane = existing_idx;
            } else {
                active_lanes[primary_lane] = LaneInfo { commit_id: p_id.clone(), color: my_color.clone() };
            }
        } else {
            active_lanes[primary_lane] = LaneInfo { commit_id: String::new(), color: String::new() };
        }

        let mut other_parents_old_lanes = Vec::new();
        for p_id in commit.parents.iter().skip(1) {
            if let Some(existing_idx) = active_lanes.iter().position(|l| l.commit_id == *p_id) {
                other_parents_old_lanes.push(existing_idx);
            } else {
                let new_color = COLORS[next_color_idx % COLORS.len()].to_string();
                next_color_idx += 1;
                
                if let Some(empty_idx) = active_lanes.iter().position(|l| l.commit_id.is_empty()) {
                    active_lanes[empty_idx] = LaneInfo { commit_id: p_id.clone(), color: new_color };
                    other_parents_old_lanes.push(empty_idx);
                } else {
                    other_parents_old_lanes.push(active_lanes.len());
                    active_lanes.push(LaneInfo { commit_id: p_id.clone(), color: new_color });
                }
            }
        }

        let mut next_active_lanes = Vec::new();
        let mut old_to_new_map = vec![None; active_lanes.len()];
        
        for (i, lane) in active_lanes.iter().enumerate() {
            if !lane.commit_id.is_empty() {
                old_to_new_map[i] = Some(next_active_lanes.len());
                next_active_lanes.push(lane.clone());
            }
        }
        active_lanes = next_active_lanes;

        if active_lanes.len() > max_columns { max_columns = active_lanes.len(); }
        if previous_lanes.len() > max_columns { max_columns = previous_lanes.len(); }

        for (i, prev) in previous_lanes.iter().enumerate() {
            if prev.commit_id.is_empty() { continue; }
            let from_x = i as f64 * column_width + column_width / 2.0;
            let from_y = 0.0;

            if prev.commit_id == commit.id {
                let to_x = primary_lane as f64 * column_width + column_width / 2.0;
                let to_y = row_height / 2.0;
                paths.push(GraphPath {
                    path: draw_branch_curve(from_x, from_y, to_x, to_y, row_height),
                    color: prev.color.clone()
                });
            } else {
                if let Some(next_idx) = active_lanes.iter().position(|l| l.commit_id == prev.commit_id) {
                    let to_x = next_idx as f64 * column_width + column_width / 2.0;
                    let to_y = row_height;
                    paths.push(GraphPath {
                        path: draw_branch_curve(from_x, from_y, to_x, to_y, row_height),
                        color: prev.color.clone()
                    });
                }
            }
        }

        if !commit.parents.is_empty() {
            if let Some(Some(new_parent_lane)) = old_to_new_map.get(first_parent_old_lane) {
                let from_x = primary_lane as f64 * column_width + column_width / 2.0;
                let from_y = row_height / 2.0;
                let to_x = *new_parent_lane as f64 * column_width + column_width / 2.0;
                let to_y = row_height;
                paths.push(GraphPath {
                    path: draw_branch_curve(from_x, from_y, to_x, to_y, row_height),
                    color: my_color.clone()
                });
            }
        }

        for old_lane in other_parents_old_lanes {
            if let Some(Some(new_lane)) = old_to_new_map.get(old_lane) {
                let from_x = primary_lane as f64 * column_width + column_width / 2.0;
                let from_y = row_height / 2.0;
                let to_x = *new_lane as f64 * column_width + column_width / 2.0;
                let to_y = row_height;
                paths.push(GraphPath {
                    path: draw_branch_curve(from_x, from_y, to_x, to_y, row_height),
                    color: active_lanes[*new_lane].color.clone()
                });
            }
        }

        rows.push(GraphRow {
            commit_id: commit.id.clone(),
            dot_color: my_color,
            dot_column: primary_lane,
            paths,
            has_refs: !commit.refs.is_empty(),
        });
    }

    (rows, active_lanes, next_color_idx, max_columns)
}
