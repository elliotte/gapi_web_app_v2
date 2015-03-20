class Circle < ActiveRecord::Base
	
	belongs_to :user
	has_many :team_members, dependent: :destroy
	has_many :team_files, dependent: :destroy
	has_many :messages, dependent: :destroy
	has_many :wallpins, dependent: :destroy

	def self.share_team_files client, user, teamfiles
		drive = client.discovered_api('drive', 'v2')
		google = GoogleService.new(client, drive)
		team_name = Circle.find(teamfiles.first.circle_id).display_name
		teamfiles.each do |teamfile|
          	#files_shared = true
          	google.insert_new_files_permission( user, teamfile.file_id )
        end
	end
end
