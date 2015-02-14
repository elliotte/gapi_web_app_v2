class CreateWallpins < ActiveRecord::Migration
  def change
    create_table :wallpins do |t|
      t.references :circle, index: true
      t.string :summary
      t.string :added_by
      t.string :file_link

      t.timestamps
    end
  end
end
