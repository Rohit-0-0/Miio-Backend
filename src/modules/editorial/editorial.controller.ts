import type { Request, Response } from 'express';
import { EditorialService } from '@/integrations/sanity/services/editorial.service';
import { EditorialMapper } from './editorial.mapper';

export class EditorialController {
  private editorialService = new EditorialService();

  public getAbout = async (_req: Request, res: Response) => {
    try {
      const sanityAbout = await this.editorialService.getAbout();
      if (!sanityAbout) {
        return res.status(404).json({ success: false, message: 'About content not found' });
      }

      const aboutData = EditorialMapper.toAboutDto(sanityAbout);

      return res.status(200).json({
        success: true,
        data: aboutData,
      });
    } catch (error) {
      console.error('Error fetching about editorial:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public getLocation = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const sanityLocation = await this.editorialService.getLocation(slug as string);
      if (!sanityLocation) {
        return res.status(404).json({ success: false, message: 'Location not found' });
      }

      // We can just return the Sanity object or map it. Let's return it directly for now since it's already mapped via query.
      return res.status(200).json({
        success: true,
        data: sanityLocation,
      });
    } catch (error) {
      console.error('Error fetching location editorial:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public getLocations = async (_req: Request, res: Response) => {
    try {
      const sanityLocations = await this.editorialService.getLocations();
      return res.status(200).json({
        success: true,
        data: sanityLocations || [],
      });
    } catch (error) {
      console.error('Error fetching locations editorial:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public getJournalPage = async (_req: Request, res: Response) => {
    try {
      const page = await this.editorialService.getJournalPage();
      return res.status(200).json({
        success: true,
        data: page || {},
      });
    } catch (error) {
      console.error('Error fetching journal page editorial:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  public getLocationsPage = async (_req: Request, res: Response) => {
    try {
      const page = await this.editorialService.getLocationsPage();
      return res.status(200).json({
        success: true,
        data: page || {},
      });
    } catch (error) {
      console.error('Error fetching locations page editorial:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
}
