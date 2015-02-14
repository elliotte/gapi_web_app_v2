# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150214171356) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "circles", force: true do |t|
    t.string   "display_name"
    t.text     "description"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id"
  end

  create_table "messages", force: true do |t|
    t.integer  "circle_id"
    t.string   "text"
    t.string   "added_by"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "messages", ["circle_id"], name: "index_messages_on_circle_id", using: :btree

  create_table "team_files", force: true do |t|
    t.integer  "circle_id"
    t.string   "file_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "team_members", force: true do |t|
    t.integer  "circle_id"
    t.string   "google_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", force: true do |t|
    t.string   "google_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email"
  end

  create_table "wallpins", force: true do |t|
    t.integer  "circle_id"
    t.string   "summary"
    t.string   "added_by"
    t.string   "file_link"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "wallpins", ["circle_id"], name: "index_wallpins_on_circle_id", using: :btree

end
