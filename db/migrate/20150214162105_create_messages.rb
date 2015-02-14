class CreateMessages < ActiveRecord::Migration
  def change
    create_table :messages do |t|
      t.references :circle, index: true
      t.string :text
      t.string :added_by

      t.timestamps
    end
  end
end
